const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST"]
    }
});

const studentRoutes = require("./routes/students");
const feedbackRoutes = require("./routes/feedback"); 
const adminRoutes = require("./routes/admin");
const reportRoutes = require("./routes/reports");
const dashboardRoutes = require("./routes/dashboard");
const speechRoutes = require("./routes/speech");
const sentimentRoutes = require("./routes/sentiment");
const summaryRoutes = require("./routes/summary");
const {
  startMonthlyFeedbackReminderJob,
  scheduleTodayNoonTestReminder,
} = require("./controllers/monthlyFeedbackReminderJob");

// Middleware
app.use(cors({
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/edupulse")
  .then(() => {
    console.log("MongoDB Connected 😎🔥");
    startMonthlyFeedbackReminderJob();
  })
  .catch((err) => console.log("MongoDB Error ❌", err));

app.use("/api/students", studentRoutes);
app.use("/api/feedback", feedbackRoutes); 
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api", speechRoutes);
app.use("/api", sentimentRoutes);
app.use("/api", summaryRoutes);

const { AssemblyAI } = require('assemblyai');
const aai = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });

async function processAudioChunk(socket) {
    try {
        if (socket.audioChunks.length === 0) return;
        
        // Combine recent audio chunks
        const audioBuffer = Buffer.concat(socket.audioChunks);
        socket.audioChunks = []; // Clear processed chunks
        
        // Convert raw PCM to WAV format
        const sampleRate = 16000; // 16kHz sample rate
        const numChannels = 1; // Mono
        const bitsPerSample = 16; // 16-bit
        
        // Create WAV file header
        const wavHeader = createWavHeader(audioBuffer.length, sampleRate, numChannels, bitsPerSample);
        const wavBuffer = Buffer.concat([wavHeader, audioBuffer]);
        
        // Use AssemblyAI for transcription with streaming-like experience 
        const transcript = await aai.transcripts.transcribe({
            audio: wavBuffer,
            language_detection: true,
            speech_models: ['universal-2']
        });
        
        if (transcript.status === 'completed' && transcript.text && transcript.text.length > 0) {
            // Emit as partial transcript first for real-time feel
            socket.emit('partial-transcript', {
                text: transcript.text,
                confidence: transcript.confidence || 0.9
            });
            
            // Emit final transcript immediately if transcription is no longer active (stopping)
            if (!socket.transcriptionActive) {
                socket.emit('final-transcript', {
                    text: transcript.text,
                    confidence: transcript.confidence || 0.9
                });
            } else {
                // Then emit as final after short delay for ongoing sessions
                setTimeout(() => {
                    if (socket.transcriptionActive) {
                        socket.emit('final-transcript', {
                            text: transcript.text,
                            confidence: transcript.confidence || 0.9
                        });
                    }
                }, 1000);
            }
        } else if (transcript.status === 'error') {
            //console.error('❌ Transcription failed:', transcript.error);
            socket.emit('transcription-error', { error: transcript.error });
        } else {
            //console.log('⚠️ No transcription text returned - status:', transcript.status);
            // Emit status to show the system is working
            socket.emit('partial-transcript', {
                text: '(processing...)',
                confidence: 0.3
            });
        }
        
    } catch (error) {
        console.error('💥 Error processing audio chunk:', error.message);
        console.error('Full error:', error);
        
        socket.emit('transcription-error', { 
            error: `Audio processing failed: ${error.message}` 
        });
    }
}

function createWavHeader(dataLength, sampleRate, numChannels, bitsPerSample) {
    const buffer = Buffer.alloc(44);
    
    // RIFF header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataLength, 4);
    buffer.write('WAVE', 8);
    
    // fmt chunk
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // chunk size
    buffer.writeUInt16LE(1, 20); // audio format (PCM)
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * numChannels * bitsPerSample / 8, 28); // byte rate
    buffer.writeUInt16LE(numChannels * bitsPerSample / 8, 32); // block align
    buffer.writeUInt16LE(bitsPerSample, 34);
    
    // data chunk
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataLength, 40);
    
    return buffer;
}

io.on('connection', (socket) => {
    //console.log('Client connected for real-time transcription');
    
    socket.on('start-recording', async () => {
        //console.log('Starting real-time transcription with Universal Streaming...');
        
        try {
            // Use AssemblyAI Universal Streaming model
            socket.audioChunks = [];
            socket.transcriptionActive = true;
            
            // Start a transcription session using the new streaming API
            //console.log('Initialized Universal Streaming session');
            socket.emit('recording-started');
            
            // Process audio chunks in batches for real-time-like experience
            socket.processingInterval = setInterval(async () => {
                //console.log(`⏰ Processing interval triggered. Chunks available: ${socket.audioChunks.length}`);
                if (socket.audioChunks.length > 0 && socket.transcriptionActive) {
                    await processAudioChunk(socket);
                }
            }, 2000); // Process every 2 seconds for real-time feel
            
        } catch (error) {
            console.error('Failed to start Universal Streaming:', error);
            socket.emit('transcription-error', { 
                error: `Failed to initialize streaming: ${error.message}` 
            });
        }
    });

    socket.on('audio-data', (data) => {
        if (socket.transcriptionActive && socket.audioChunks) {
            try {
                // Collect audio chunks for batch processing
                const audioBuffer = Buffer.from(data);
                socket.audioChunks.push(audioBuffer);
                //console.log(`✅ Audio chunk received: ${audioBuffer.length} bytes (total chunks: ${socket.audioChunks.length})`);
                
                // Limit chunk buffer to prevent memory issues (keep last 10 chunks)
                if (socket.audioChunks.length > 10) {
                    socket.audioChunks = socket.audioChunks.slice(-10);
                }
            } catch (error) {
                console.error(`❌ Error processing audio data:`, error.message);
            }
        } else {
            console.warn('⚠️ Transcription not active or chunks array not initialized');
        }
    });

    socket.on('stop-recording', async () => {
        if (socket.processingInterval) {
            clearInterval(socket.processingInterval);
            socket.processingInterval = null;
        }
        
        // Process any remaining chunks before stopping
        if (socket.audioChunks && socket.audioChunks.length > 0) {
            try {
                // Mark as stopping but keep active for processing
                socket.transcriptionActive = false; // This signals processAudioChunk to emit final immediately
                await processAudioChunk(socket);
            } catch (error) {
                console.error('❌ Error processing final chunks:', error.message);
            }
            socket.audioChunks = [];
        } else {
            socket.transcriptionActive = false;
        }
        
        socket.emit('recording-stopped');
        console.log('Universal Streaming session terminated');
    });

    socket.on('disconnect', () => {
        //console.log('Client disconnected');
        
        // Clean up Universal Streaming resources
        socket.transcriptionActive = false;
        
        if (socket.processingInterval) {
            clearInterval(socket.processingInterval);
            socket.processingInterval = null;
        }
        
        if (socket.audioChunks) {
            socket.audioChunks = [];
        }
        
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});

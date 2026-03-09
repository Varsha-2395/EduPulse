# mice 小白鼠
+ 简洁实用的测试数据生成接口

### 安装
npm install mice

### 使用
```javascript
  
  var mice = require('mice')('cn'); // 目前只支持cn、en, 默认cn

  // 生成词语
  mice.word();  // 单个词语
  mice.words(10, '-'); // 10个词语， 并用分隔符‘－’连接


  // 句子
  mice.sentence(); // 单个句子
  mice.sentences(5, '<br>'); // 多个句子，并用分隔符‘<br>’连接
  mice.sentences(5, ['<p>', '</p>']); // 用首尾型tag连接

  // 段落
  mice.paragraph(); //当个段落
  mice.paragraphs(5, '<br>'); // 多个段落，分隔符使用同上


  // 英语接口与汉字一样。

```

### inspiration
+ 汉字素材选用的是常用汉字，生僻字就不考虑了。
+ 英语素材选用借鉴了 https://github.com/boo1ean/casual
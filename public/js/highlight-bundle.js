// 导入highlight.js核心
import hljs from 'highlight.js/lib/core';

// 导入常用语言
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';

// 注册语言
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('python', python);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('json', json);
hljs.registerLanguage('markdown', markdown);

// Configure Marked.js with highlight.js integration
document.addEventListener('DOMContentLoaded', function() {
  // Configure marked.js with highlight.js for code syntax highlighting
  marked.setOptions({
    highlight: function(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(lang, code).value;
        } catch (err) {}
      }
      
      try {
        return hljs.highlightAuto(code).value;
      } catch (err) {}
      
      return code;
    },
    headerIds: true,
    gfm: true,
    breaks: true,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: true
  });
  
  // Initialize any client-side markdown rendering
  document.querySelectorAll('.markdown-content').forEach(function(element) {
    const markdown = element.textContent;
    const html = marked(markdown);
    element.innerHTML = html;
  });
  
  // Apply syntax highlighting to all code blocks
  document.querySelectorAll('pre code').forEach(function(block) {
    hljs.highlightBlock(block);
  });
});

// 导出hljs以便全局使用
window.hljs = hljs; 
import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import FontSize from '@tiptap/extension-font-size'; // 👈 1. FontSize 라이브러리 import
import { Color } from "@tiptap/extension-color";
import Placeholder from "@tiptap/extension-placeholder";
import './TiptapEditor.css'; // 에디터와 메뉴바를 위한 CSS
// import Underline from '@tiptap/extension-underline';
// import { TextStyle as BaseTextStyle } from '@tiptap/extension-text-style';

// const TextStyle = BaseTextStyle.extend({
//   addAttributes() {
//     return {
//       ...this.parent?.(),
//       fontSize: {
//         default: null,
//         parseHTML: element => element.style.fontSize || null,
//         renderHTML: attributes => {
//           if (!attributes.fontSize) {
//             return {};
//           }
//           return {
//             style: `font-size: ${attributes.fontSize}`,
//           };
//         },
//       },
//     };
//   },
// });

// --- 메뉴바 컴포넌트 ---
const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  //글자 크기 목록
  const fontSizes = ['12px', '14px', '16px', '18px', '24px'];

  return (
    <div className="menu-bar">
      {/* <select
        onChange={(e) => editor.chain().focus().setMark('textStyle', { fontSize: e.target.value}).run()}
        className="font-size-select"
      >
        <option value="">크기</option>
        {fontSizes.map(size => (
          <option key={size} value={size}>{size}</option>
        ))}
        </select> */}
        <select
  //       onChange={e => {
  //   console.log('Font size changed:', e.target.value); // 디버깅용 로그
  //   e.target.value && editor.chain().focus().setMark('textStyle', { fontSize: e.target.value }).run();
    
  // }}
        onChange={e => e.target.value && editor.chain().focus().setFontSize(e.target.value).run()}
        value={editor.getAttributes('textStyle').fontSize || ''}
        className="font-size-select"
      >
        <option value="">크기</option>
        {fontSizes.map(size => (
          <option key={size} value={size}>{size}</option>
        ))}
      </select>
      {/* --- 👇 글자 색상 변경 input 추가 --- */}
      <input
        type="color"
        onInput={event => editor.chain().focus().setColor(event.target.value).run()}
        value={editor.getAttributes('textStyle').color || '#000000'}
        className="color-input"
      />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
      >
        굵게
      </button>
      <button
        type='button'
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
      >
        기울임
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        //disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? 'is-active' : ''}
      >
        밑줄
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
      >
        목록
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        //disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'is-active' : ''}
      >
        취소선
      </button>
      {/* 여기에 다른 버튼들을 추가할 수 있습니다. */}
    </div>
  );
};

// --- 메인 에디터 컴포넌트 ---
function TiptapEditor({ content, onChange }) {
  // 👇 --- 리렌더링을 유발하기 위한 상태 --- 👇
  const [_, setForceUpdate] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      FontSize,
      // Underline,
      Placeholder.configure({
        placeholder: '내용을 입력하세요.',
      }),
    ],
    // 👇 content는 여기서 초기화 용도로만 사용됩니다.
    content: content, // 부모로부터 받은 초기 content
    onUpdate: ({ editor }) => {
      // 내용이 업데이트될 때마다 부모의 상태를 변경
      onChange(editor.getHTML());
        // 👇 내용이 업데이트 될 때마다 상태를 강제로 변경하여 리렌더링 유발
      setForceUpdate(prev => prev + 1);
    },
     // 👇 선택 영역이 바뀔 때마다 상태를 강제로 변경하여 리렌더링 유발
    onSelectionUpdate: () => {
      setForceUpdate(prev => prev + 1);
    },
  });

  // 👇 --- 이 부분이 새로 추가된 핵심 로직입니다 --- 👇
  useEffect(() => {
    // editor가 준비되고, 부모로부터 받은 content와 현재 에디터의 content가 다를 때만 실행
    if (editor && content !== editor.getHTML()) {
      // editor.commands.setContent()를 사용해 에디터의 내용을 강제로 업데이트합니다.
      editor.commands.setContent(content);
    }
  }, [content, editor]); // 부모의 content prop이 바뀔 때마다 이 로직을 재실행합니다.


  return (
    <div className="tiptap-container">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

export default TiptapEditor;
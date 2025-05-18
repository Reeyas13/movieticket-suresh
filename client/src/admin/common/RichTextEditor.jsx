import React, { useRef, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const RichTextEditor = ({ value, onChange, placeholder = 'Write something awesome...' }) => {
  const editorRef = useRef(null);

  const handleEditorChange = (content) => {
    if (onChange) {
      onChange(content);
    }
  };

  // Configuration for file picker - allows local image upload
  const imageUploadHandler = (blobInfo, progress) => {
    return new Promise((resolve, reject) => {
      try {
        // Convert the blob to a base64 data URL
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result;
          resolve(base64);
        };
        reader.onerror = () => {
          reject(`Error reading file: ${reader.error}`);
        };
        reader.readAsDataURL(blobInfo.blob());
      } catch (error) {
        reject(`Error uploading image: ${error.message}`);
      }
    });
  };

  // Add a setup function to modify editor behavior when initialized
  const editorSetup = (editor) => {
    // Add a custom style for tables in the content
    editor.on('init', function() {
      // Add responsive table styles to the editor content CSS
      const contentCSS = editor.contentCSS || [];
      editor.contentCSS = [...contentCSS, ...editorContentCSS];
      
      // Process existing tables in the editor content
      wrapTablesWithResponsiveContainer(editor);
    });

    // Make tables responsive when they're inserted/modified
    editor.on('SetContent', function() {
      wrapTablesWithResponsiveContainer(editor);
    });
    
    // Also add the wrapper when a new table is created
    editor.on('NewBlock', function() {
      wrapTablesWithResponsiveContainer(editor);
    });
  };

  // Function to wrap tables in responsive containers
  const wrapTablesWithResponsiveContainer = (editor) => {
    if (!editor || !editor.getBody()) return;
    
    const tables = editor.getBody().querySelectorAll('table:not(.responsive-table)');
    tables.forEach(table => {
      // Add the responsive class to the table
      table.classList.add('responsive-table');
      
      // Check if table is already wrapped in a container
      if (table.parentNode.classList.contains('responsive-table-container')) return;
      
      // Create responsive container
      const wrapper = editor.dom.create('div', { 'class': 'responsive-table-container' });
      
      // Insert the wrapper before the table
      editor.dom.insertAfter(wrapper, table);
      
      // Move the table inside the wrapper
      wrapper.appendChild(table);
    });
  };
  
  // Custom styles to add to the editor content
  const editorContentCSS = [
    `
    .responsive-table-container {
      width: 100%;
      overflow-x: auto;
      margin-bottom: 1rem;
    }
    .responsive-table {
      width: 100%;
      border-collapse: collapse;
    }
    `
  ];

  return (
    <div className="rich-text-editor">
      <Editor
        onInit={(evt, editor) => editorRef.current = editor}
        apiKey="9lqt7iwnyd7waa2algu1q4jh2fozxnazpvhdq5h831orlx1c"
        value={value}
        onEditorChange={handleEditorChange}
        init={{
          height: 400,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | image link table | help',
          content_style: `
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
              font-size: 16px;
            }
            .responsive-table-container {
              width: 100%;
              overflow-x: auto;
              margin-bottom: 1rem;
            }
            .responsive-table {
              width: 100%;
              border-collapse: collapse;
            }
          `,
          placeholder: placeholder,
          // Image upload settings
          images_upload_handler: imageUploadHandler,
          automatic_uploads: true,
          file_picker_types: 'image',
          setup: editorSetup,
          // Custom file picker that triggers browser's file selector
          file_picker_callback: function(callback, value, meta) {
            // Only for images
            if (meta.filetype === 'image') {
              // Create a DOM input element
              const input = document.createElement('input');
              input.setAttribute('type', 'file');
              input.setAttribute('accept', 'image/*');
              
              input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                
                if (file) {
                  const reader = new FileReader();
                  reader.addEventListener('load', () => {
                    // Convert image to base64 string
                    const id = 'blobid' + (new Date()).getTime();
                    const blobCache = editorRef.current.editorUpload.blobCache;
                    const base64 = reader.result.split(',')[1];
                    const blobInfo = blobCache.create(id, file, base64);
                    blobCache.add(blobInfo);
                    
                    // Provide image info to callback
                    callback(blobInfo.blobUri(), { title: file.name });
                  });
                  reader.readAsDataURL(file);
                }
              });
              
              // Trigger the file selector
              input.click();
            }
          },
          // Table settings
          table_responsive_width: true,
          table_default_attributes: {
            class: 'responsive-table'
          },
          table_default_styles: {
            width: '100%'
          },
          table_appearance_options: false, // Use our custom styling
          table_advtab: true,
          table_cell_advtab: true,
          table_row_advtab: true,
          table_class_list: [
            {title: 'Responsive Table', value: 'responsive-table'}
          ],
          table_resize_bars: true
        }}
      />
    </div>
  );
};

export default RichTextEditor;

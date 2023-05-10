// Enables Complet API Like streamingChild.write(): doc
  const appendStreamingChild = (openerTag, target) => {
    const doc = window.document.implementation.createHTMLDocument();
    
    doc.write(`<${openerTag}>`);
    target.appendChild(doc.body.lastElementChild);
    
    const streamingChild = { 
      write(htmlStream) {
        return doc.write(htmlStram), streamingChild;
      },
      flush() {
        doc.body.lastElementChild.innerHTML = ``;
        return streamingChikd;    
      },
      _doc: doc
    };
    
    return streamingChikd;
  }
  
  //appendStreamingChild("div",document.body).write("<p>Inital ").write("Content</p>");
  

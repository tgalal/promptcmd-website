(function(window){
  let cast_containers = document.getElementsByClassName("cast-container");
  for (const element of cast_containers) {
    let cast_value = element.dataset.cast;
    let cast_file = `/casts/${cast_value}.cast`;
    AsciinemaPlayer.create(cast_file, element,
      {
        preload: true,
        autoplay: false,
        poster: "npt:00:40",
        theme: "mytheme",
        controls: "auto",
        // fit: false,
        speed: 2,
        idleTimeLimit: 1
      }
    );
  }

  window.openModal = function(name) {
    const meta = meta_by_name(name);
    const originalContent = window.promptContents[meta.filename];
    const updatedContent = updatePromptModel(originalContent, currentModel);

    document.getElementById('modalTitle').textContent = meta.name;
    document.getElementById('modalDescription').textContent = meta.description;
    document.getElementById('modalPromptContent').innerHTML = highlightPrompt(updatedContent);

    // Set curl command
    const baseUrl = window.location.origin;
    const promptUrl = `${baseUrl}{{ "//" | relURL }}${meta.filename}`;
    const curlCommand = getImportCommand(meta);
    document.getElementById('modalCurlCommand').textContent = curlCommand;

    const downloadBtn = document.getElementById('modalDownloadBtn');
    const importBtn = document.getElementById('modalImportBtn');
    const copyBtn = document.getElementById('modalCopyBtn');

    downloadBtn.onclick = () => {
      downloadPrompt(this, index);
    };

    copyBtn.onclick = () => {
      copyToClipboard(updatedContent, copyBtn);
    };

    importBtn.onclick = () => {
      copyToClipboard(getImportCommand(meta), importBtn);
    };

    document.getElementById('promptModal').classList.add('active');
    document.body.classList.add('modal-open');
  }
  window.copyCurlCommand = function() {
      const curlCommand = document.getElementById('modalCurlCommand').textContent;
      const btn = document.getElementById('modalCurlCopyBtn');
      copyToClipboard(curlCommand, btn);
  }

  window.closeModal = function() {
      document.getElementById('promptModal').classList.remove('active');
      document.body.classList.remove('modal-open');
  }

  document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
  });

  let currentModel = "";

  function meta_by_name(name) {
    return window.promptsData.find(p => p.name == name);
  }

  function updatePromptModel(originalContent, currentModel) {
    return originalContent;
  }

  window.copySnippet = function(btn, name) {
      const meta = meta_by_name(name);
      const originalContent = window.promptContents[meta.filename];
      const updatedContent = updatePromptModel(originalContent, currentModel);
      copyToClipboard(updatedContent, btn);
  }

  window.downloadPrompt = function (btn, name) {
      const meta = meta_by_name(name);
      const originalContent = window.promptContents[meta.filename];
      const content = updatePromptModel(originalContent, currentModel);

      const filename = meta.filename;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  }

  function getImportCommand(promptobj) {
    if (currentModel) {
      return `curl  -LsSf https://promptcmd.sh/p/${promptobj.filename} | promptctl i -m "${currentModel}" -ep ${promptobj.name} -`;
    } else {
      return `curl  -LsSf https://promptcmd.sh/p/${promptobj.filename} | promptctl i -ep ${promptobj.name} -`;
    }
  }

  window.copyImport = function(btn, name) {
      const meta = meta_by_name(name);
      let cmd = getImportCommand(meta)
      copyToClipboard(cmd, btn);
  }
  window.highlightPrompt = function (content) {
      const lines = content.split('\n');
      let inFrontmatter = false;
      let frontmatterEnded = false;
      let html = '';

      lines.forEach((line, index) => {
          const trimmed = line.trim();

          if (trimmed === '---') {
              if (!inFrontmatter) {
                  inFrontmatter = true;
                  html += `<span class="yaml-comment">${escapeHtml(line)}</span>`;
              } else {
                  inFrontmatter = false;
                  frontmatterEnded = true;
                  html += `<span class="yaml-comment">${escapeHtml(line)}</span>`;
              }
          } else if (frontmatterEnded) {
              html += `<span class="template-text">${escapeHtml(line)}</span>`;
          } else if (inFrontmatter) {
              if (trimmed.startsWith('#')) {
                  html += `<span class="yaml-comment">${escapeHtml(line)}</span>`;
              } else if (line.includes(':')) {
                  const colonIndex = line.indexOf(':');
                  const key = line.substring(0, colonIndex);
                  const value = line.substring(colonIndex + 1);
                  html += `<span class="yaml-key">${escapeHtml(key)}:</span>`;
                  if (value) {
                      html += `<span class="yaml-value">${escapeHtml(value)}</span>`;
                  }
              } else {
                  html += escapeHtml(line);
              }
          } else {
              html += escapeHtml(line);
          }

          if (index < lines.length - 1) {
              html += '\n';
          }
      });

      return html;
  }

})(window);

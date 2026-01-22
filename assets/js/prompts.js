// Prompts page JavaScript
// Note: currentProvider and currentModel are defined in prompts.html inline script

function updateProvider(skipQueryUpdate = false) {
    const provider = document.getElementById('providerSelect').value;
    currentProvider = provider;

    const modelSelect = document.getElementById('modelSelect');
    const modelInput = document.getElementById('modelInput');

    if (provider === 'none') {
        // Show disabled "None/Default" in model selector
        modelSelect.style.display = 'block';
        modelInput.style.display = 'none';
        modelSelect.innerHTML = '<option value="">None/Default</option>';
        modelSelect.disabled = true;
        currentModel = null;
    } else if (provider === 'other') {
        modelSelect.style.display = 'none';
        modelInput.style.display = 'block';
        modelSelect.disabled = false;
        modelInput.focus();
        currentModel = modelInput.value;
    } else {
        modelSelect.style.display = 'block';
        modelInput.style.display = 'none';
        modelSelect.disabled = false;

        // Populate model dropdown
        const models = window.providerData[provider].models;
        modelSelect.innerHTML = '<option value="none">None/Default</option>'
          + models.map(m =>
            `<option value="${m}">${m}</option>`
        ).join('');

        currentModel = getModelString(provider, "none");
    }

    renderAllPrompts();

    if (!skipQueryUpdate) {
        updateQueryString();
    }
}

function updateModel(skipQueryUpdate = false) {
    const modelSelect = document.getElementById('modelSelect');
    const modelInput = document.getElementById('modelInput');


    if (currentProvider === 'other') {
        currentModel = modelInput.value;
    } else {
        const selectedModel = modelSelect.value;
        currentModel = getModelString(currentProvider, selectedModel);
    }

    renderAllPrompts();

    if (!skipQueryUpdate) {
        updateQueryString();
    }
}

function getModelString(provider, model) {
    if (model == "none") {
      return provider;
    } else {
        return `${provider}/${model}`;
    }
}

function updateQueryString() {
    const params = new URLSearchParams(window.location.search);

    if (currentProvider && currentProvider !== 'none') {
        params.set('provider', currentProvider);
    } else {
        params.delete('provider');
    }

    if (currentModel) {
        // Extract just the model part without provider prefix for query string
        let modelForQuery = currentModel;
        if (currentProvider !== 'other' && currentModel.includes('/')) {
            // Remove "provider/" prefix from model
            modelForQuery = currentModel.split('/')[1];
        } else if (currentModel === currentProvider) {
            // Model is just provider name, don't add to query string
            modelForQuery = null;
        }

        if (modelForQuery) {
            params.set('model', modelForQuery);
        } else {
            params.delete('model');
        }
    } else {
        params.delete('model');
    }

    const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}${window.location.hash}`
        : `${window.location.pathname}${window.location.hash}`;

    history.replaceState(null, '', newUrl);
}

function applyQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const provider = params.get('provider');
    const model = params.get('model');

    if (provider) {
        const providerSelect = document.getElementById('providerSelect');
        providerSelect.value = provider;
        currentProvider = provider;
        updateProvider(true); // skipQueryUpdate = true to avoid circular update

        if (model) {
            if (provider === 'other') {
                const modelInput = document.getElementById('modelInput');
                modelInput.value = model;
                currentModel = model;
            } else {
                const modelSelect = document.getElementById('modelSelect');
                // Parse model - it might be "provider/model" or just "model"
                let modelValue = model;
                if (model.includes('/')) {
                    // Extract model part from "provider/model" format
                    modelValue = model.split('/')[1];
                } else if (model === provider) {
                    // Model is just the provider name, meaning "none" was selected
                    modelValue = 'none';
                }

                // Try to set the model value
                modelSelect.value = modelValue;
                if (modelSelect.value === modelValue) {
                    // Model exists in dropdown
                    updateModel(true);
                } else {
                    // Model doesn't exist in dropdown, set currentModel directly
                    currentModel = model;
                }
            }
            renderAllPrompts();
        }
    }
}

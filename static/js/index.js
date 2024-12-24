const fileDropArea = document.querySelector('.file-drop-area');
const fileInput = document.getElementById('file');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const result= document.getElementById('result');
const resultImage=document.getElementById('result-image');

fileDropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileDropArea.classList.add('border-secondary'); // Highlight on drag over
});

fileDropArea.addEventListener('dragleave', () => {
    fileDropArea.classList.remove('border-secondary'); // Remove highlight on drag leave
});

fileDropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileDropArea.classList.remove('border-secondary'); // Remove highlight on drop
    const files = e.dataTransfer.files;
    handleFilePreview(files[0]);
});

function handleFileInput(event) {
    const files = event.target.files;
    handleFilePreview(files[0]);
}

function handleFilePreview(file) {
    if(file==null){
        console.log("No file selected");
        imagePreview.src = '';
        imagePreviewContainer.classList.add('hidden');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
    imagePreview.src = e.target.result;
    imagePreviewContainer.classList.remove("hidden");
    result.classList.add("hidden");
    resultImage.src = '';
    };
    reader.readAsDataURL(file);
}

function toggleInputGroup(group) {
    const elements = {
    resize: ['resize-width', 'resize-height'],
    compress: ['compress-quality'],
    change_format: ['change-format'],
    crop: ['crop-top', 'crop-bottom', 'crop-left', 'crop-right'],
    rotate: ['rotate-angle'],
    filter: ['add-filter']
    };
    
    elements[group].forEach(id => {
    const element = document.getElementById(id);
    if (document.getElementById(`action-${group}`).checked) {
        element.removeAttribute('readonly');
    } else {
        element.setAttribute('readonly', true);
    }
    });
}
var blob;
function modifyImage(event){
    event.preventDefault();
    const formData=new FormData(event.target);
    fetch("/",{
        method:"POST",
        body:formData
    }).then(async response=>{
        blob=await response.blob();
        const url=URL.createObjectURL(blob);
        const img=document.createElement("img");
        img.style.display="block";
        img.style.margin="auto";
        img.src=url;
        img.style.width="auto";
        img.style.height="auto";
        img.style.maxWidth="100%";
        img.style.maxHeight="100%";
        resultImage.src=url;
        result.classList.remove("hidden");
        window.location.href="/#result";
    })
}

function generateNewFileName(originalFileName, actions) {
    // Extract the file name and extension
    const lastDotIndex = originalFileName.lastIndexOf('.');
    const baseName = originalFileName.slice(0, lastDotIndex);

    // Start building the new file name
    let newFileName = baseName;

    // Append action-specific tags
    if (actions.remove_bg) {
        newFileName += "_noBG";
    }
    if (actions.resize) {
        newFileName += `_resize_${actions.width || 'auto'}x${actions.height || 'auto'}`;
    }
    if (actions.compress) {
        newFileName += `_compressed_${actions.quality || 'default'}%`;
    }
    if (actions.change_format) {
        newFileName += `_to${actions.format || extension.toUpperCase()}`;
    }
    if (actions.crop) {
        newFileName += `_crop_${actions.top || 0}-${actions.bottom || 0}-${actions.left || 0}-${actions.right || 0}`;
    }
    if (actions.rotate) {
        newFileName += `_rotate_${actions.angle || 0}deg`;
    }
    if (actions.filter) {
        newFileName += `_filter_${actions.filter || 'none'}`;
    }

    // Add the final extension (change if needed)
    const finalExtension = actions.change_format ? actions.format.toLowerCase() : blob.type.split("/")[1];
    newFileName += `.${finalExtension}`;

    return newFileName;
}

function downloadImage(){
    const a=document.createElement("a");
    a.href=resultImage.src;
    a.download=generateNewFileName(fileInput.files[0].name, {
        remove_bg: document.getElementById("action-remove_bg").checked,
        resize: document.getElementById("action-resize").checked,
        width: document.getElementById("resize-width").value,
        height: document.getElementById("resize-height").value,
        compress: document.getElementById("action-compress").checked,
        quality: document.getElementById("compress-quality").value,
        change_format: document.getElementById("action-change_format").checked,
        format: document.getElementById("change-format").value,
        crop: document.getElementById("action-crop").checked,
        top: document.getElementById("crop-top").value,
        bottom: document.getElementById("crop-bottom").value,
        left: document.getElementById("crop-left").value,
        right: document.getElementById("crop-right").value,
        rotate: document.getElementById("action-rotate").checked,
        angle: document.getElementById("rotate-angle").value,
        filter: document.getElementById("action-filter").checked? document.getElementById("add-filter").value : null,
    });
    a.click();
}
/* Native lazy-loaded demo screenshots; restore the text cover if an image fails. */
(()=>{for(const image of document.querySelectorAll(".native-demo-preview")){const fail=()=>{image.hidden=true;};image.addEventListener("error",fail,{once:true});if(image.complete&&!image.naturalWidth)fail();}})();

/* Keep the static design image in place when a preview is paused or fails. */
(()=>{for(const img of document.querySelectorAll(".nx-industry-poster")){const fail=()=>{const fallback=img.dataset.original;if(fallback&&img.getAttribute("src")!==fallback){img.src=fallback;return}img.hidden=true};img.addEventListener("error",fail);if(img.complete&&!img.naturalWidth)fail()}})();
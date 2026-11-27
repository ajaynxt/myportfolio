/* Native lazy-loaded demo screenshots; restore the text cover if an image fails. */
(()=>{for(const image of document.querySelectorAll(".native-demo-preview")){const fail=()=>{image.hidden=true;};image.addEventListener("error",fail,{once:true});if(image.complete&&!image.naturalWidth)fail();}})();

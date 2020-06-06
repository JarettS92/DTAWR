// Dashboard store modal
// Clicking an image makes it larger to view
$('.media__item img').click(function () {
    document.getElementById("myModal").style.display = "block";
    document.getElementById("img01").src = this.src;
    document.getElementById("caption").innerHTML = this.alt;
});
$('#close').click(function () {
    document.getElementById("myModal").style.display = "none";
});
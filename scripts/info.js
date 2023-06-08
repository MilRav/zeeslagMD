// Get all the ship elements
var ships = document.getElementsByClassName("shipImg");

// Iterate over each ship element
for (var i = 0; i < ships.length; i++) {
    var ship = ships[i];
    var modalId = ship.getAttribute("data-modal");
    var modal = document.getElementById(modalId);
    var span = modal.getElementsByClassName("close")[0];

    // When the user clicks the ship, open the corresponding modal
    ship.onclick = function() {
        var modalId = this.getAttribute("data-modal");
        var modal = document.getElementById(modalId);
        modal.style.display = "block";
    };

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        var modal = this.parentNode.parentNode;
        modal.style.display = "none";
    };

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target.classList.contains("modal")) {
            event.target.style.display = "none";
        }
    };
}
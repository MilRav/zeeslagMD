//Add highlight
function highlightArea(startIndex, ship) {
    const allBoardBlocks = document.querySelectorAll("#player div");
    const allHoverBlocks = document.querySelectorAll("#player div.hover");
    let isHorizontal = angle === 0;
    let _aHoverBlocks = []

    const { shipBlocks, valid, notTaken } = getValibility(
        allBoardBlocks,
        isHorizontal,
        startIndex,
        ship
    );

    if (valid && notTaken) {
        shipBlocks.forEach((shipBlock) => {
            shipBlock.classList.add("hover");
            _aHoverBlocks.push(shipBlock.id);
        });
    }

    //remove other hover marked blocks
    allHoverBlocks.forEach((_elBlock) => {
        if (_aHoverBlocks) {
            if (!_aHoverBlocks.includes(_elBlock.id)) {
                _elBlock.classList.remove("hover");
            }
        } else {
            _elBlock.classList.remove("hover");
        }
    });
}

function removeHighlightArea() {
    //remove hover class
    const allHoverBlocks = document.querySelectorAll("#player div.hover");
    allHoverBlocks.forEach((_elBlock) => {
        _elBlock.classList.remove("hover");
    });
}
let block = new ImageObject({
    //11*16
    position: new Vector2(0, 0),
    drawCollider: false,
    colliderSize: new Vector2(48, 48),
});

// (async function () {
//     block.image = await resManager.LoadImage('Resources/Block.png');
// })();
async function setImage(image){
    block.image = await resManager.LoadImage(image);
    console.log(block.Image);
}

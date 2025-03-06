let block = new ImageObject({
    //11*16
    position: new Vector2(0, 10),
    drawCollider: true,
    colliderSize: new Vector2(48, 48)
});

// (async function () {
//     block.image = await resManager.LoadImage('Resources/Block.png');
// })();
async function setImage(image){
    block.image = await resManager.LoadImage(image);
}

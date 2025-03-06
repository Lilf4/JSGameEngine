let block = new ImageObject({
    //11*16
    position: new Vector2(0, 10),
    drawCollider: true,
    colliderSize: new Vector2(800, 500)
});

// (async function () {
//     block.image = await resManager.LoadImage('Resources/Block.png');
// })();
async function setImage(image){
    block.image = await resManager.LoadImage(image);
    console.log(block.Image);
}

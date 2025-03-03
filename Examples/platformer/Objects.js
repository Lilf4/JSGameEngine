let block = new ImageObject({
    //11*16
    position: new Vector2(0, 0),
    drawCollider: true,
    colliderSize: new Vector2(48, 48),
});

(async function () {
    block.Image = await resManager.LoadImage('Resources/Block.png');
})();
// async function setImage(image){
//     block.Image = await resManager.LoadImage(image);
//     console.log(block.Image);
// }

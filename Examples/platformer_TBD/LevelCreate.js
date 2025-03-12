// Level test X: air/none B: Block/Ground
// 11 pieces in the test 5 blocks, 6 air
const level =   "XXXBBBBBXXX";

function CreateLeveL(object_size = new Vector2(16,16)) {
    const parts = level.split('');
    let blocks = [];
    for (let i = 0; i < parts.length; i++) {
        if (parts[i] == 'B') {

            let newBlock = block;
            newBlock.position = new Vector2(-Engine.screenSize.x/2 + 48*i, 5);
            blocks.push(newBlock)
        }
    }
    console.log(blocks.length)
    Engine.AddObject(blocks[0])
}
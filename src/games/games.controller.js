exports.gamesList = (req, res, next) => {
    res.send([{ id: 1, game: "csgo", fullName: "Counter Strikie: Global Offensive" }, { id: 2, game: "minecraft", fullName: "Minecraft" }]);
}
exports.gamesList = (req, res, next) => {
  res.send([
    { id: 1, game: "csgo", fullName: "Counter Strikie: Global Offensive" },
    { id: 2, game: "minecraft", fullName: "Minecraft" },
    { id: 3, game: "teamspeak", fullName: "TeamSpeak 3" }
  ]);
};

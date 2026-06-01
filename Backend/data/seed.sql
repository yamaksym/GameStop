--This is the games that avaiable in the project
INSERT INTO games (id, title, genre, image_path, link_path, description, developer, price, currency) VALUES
('adofai', 'A Dance of Fire and Ice', 'Rhythm', 'IMG/ADOFAI.jpg', 'ADOFAI.html', 'A Dance of Fire and Ice is a strict rhythm game. Keep your focus as you guide two orbiting planets along a winding path without breaking their perfect equilibrium.', '7th Beat Games', 119.99, 'UAH'),
('gd', 'Geometry Dash', 'Rhythm', 'IMG/GD.jpg', 'GD.html', 'Jump and fly your way through danger in this rhythm-based action platformer!', 'RobTop Games', 124.99, 'UAH'),
('muse_dash', 'Muse Dash', 'Rhythm', 'IMG/Muse_Dash.jpg', 'Muse_Dash.html', 'Paradise of parkour & rhythm game — Muse Dash!!', 'PeroPeroGames', 22.00, 'UAH'),
('cs_2', 'Counter-Strike 2', 'FPS', 'IMG/CS_2.jpg', 'CS_2.html', 'For over two decades, Counter-Strike has offered an elite competitive experience, one shaped by millions of players from across the globe. And now the next chapter in the CS saga is about to begin. This is Counter-Strike 2.', 'Valve', 49.99, 'UAH'),
('pubg', 'PUBG Battlegrounds', 'FPS', 'IMG/Pubg.jpg', 'Pubg.html', 'Land on strategic locations, loot weapons and supplies, and survive to become the last team standing in various, diverse Battlegrounds.', 'Krafton', 39.99, 'UAH'),
('fortnite', 'Fortnite', 'Shooter', 'IMG/Fortnite.jpg', 'Fortnite.html', 'Create, play, and battle with friends for free in Fortnite. Be the last player standing in Battle Royale and Zero Build, experience a concert or live event, or discover over a million creator-made games.', 'Epic Games', 29.99, 'UAH'),
('halo', 'Halo Infinite', 'FPS', 'IMG/Halo.jpg', 'Halo.html', 'The legendary shooter series returns with the most expansive Master Chief campaign yet and a groundbreaking free-to-play multiplayer experience.', '343 Industries', 99.99, 'UAH');

--All redeemable codes
INSERT INTO redeem_codes (code, game_id) VALUES
('CS2-PLAY-FREE', 'cs_2'),
('PUBG-SURV-IVAL', 'pubg'),
('FORT-NITE-FREE', 'fortnite'),
('HALO-CHIE-F999', 'halo');

--All reviews
INSERT INTO reviews (game_id, user_email, title, content) VALUES
('cs_2', 'user1@example.com', 'Excellent Customer Service', 'I had an issue with my recent purchase and the support team resolved it within minutes. Highly recommend buying from GameStop!'),
('cs_2', 'gamer_dude@example.com', 'Beautiful Interface', 'The new design is stunning. Finding games is so much easier now and everything loads incredibly fast. The dark mode is perfect.'),
('cs_2', 'rhythm_master@example.com', 'Great selection of indies', 'I love that they highlight rhythm games alongside the major AAA shooters like CS2 and PUBG. It shows they care about all genres.');

-- Estampas de exemplo (as imagens estão em /public/estampas do site).
insert into nomads.estampas (id, nome, estilo, imagem_url, proporcao, ordem) values
  ('bussola', 'Bússola', 'aventura', '/estampas/bussola.svg', 1, 1),
  ('montanha', 'Vai e Volta', 'aventura', '/estampas/montanha.svg', 1, 2),
  ('estrada', 'Estrada Sem Fim', 'aventura', '/estampas/estrada.svg', 0.7143, 3),
  ('onda-neon', 'Onda Neon', 'anime', '/estampas/onda-neon.svg', 1, 4),
  ('lua-carmesim', 'Lua Carmesim', 'anime', '/estampas/lua-carmesim.svg', 0.7143, 5),
  ('raio', 'Raio', 'anime', '/estampas/raio.svg', 1, 6),
  ('pixel-coracao', '+1 Vida', 'jogos', '/estampas/pixel-coracao.svg', 1, 7),
  ('comando-retro', 'Press Start', 'jogos', '/estampas/comando-retro.svg', 1, 8),
  ('serra-pixel', 'Continuar?', 'jogos', '/estampas/serra-pixel.svg', 0.7143, 9),
  ('bandeira-meta', 'Meta', 'racing', '/estampas/bandeira-meta.svg', 1, 10),
  ('pistao', 'V8', 'racing', '/estampas/pistao.svg', 1, 11),
  ('curva-apex', 'Apex 26', 'racing', '/estampas/curva-apex.svg', 0.7143, 12)
on conflict (id) do nothing;

-- Tornar-se admin (depois de entrar no site com a conta):
-- insert into nomads.admins (user_id) select id from auth.users where email = 'O_TEU_EMAIL';

-- =====================================================================
-- FeedbackHub demo · datos de ejemplo
-- =====================================================================
-- SOLO para staging (y desarrollo, que usa el proyecto de staging).
-- NUNCA en producción: allí solo hay datos reales (Familia 2, idea 1).
--
-- Datos inventados: nombres de ficción y emails @example.com
-- (dominio reservado para ejemplos). Ningún dato personal real.
-- =====================================================================

insert into public.feedback (name, email, message, rating) values
  ('Ana Prueba',    'ana@example.com',    'Me encanta lo fácil que es dejar comentarios.',                      5),
  ('Luis Ejemplo',  'luis@example.com',   'Echo de menos poder adjuntar una captura.',                          4),
  ('Marta Demo',    'marta@example.com',  'El formulario tarda un poco en cargar desde el móvil.',               3),
  ('Pedro Ficticio','pedro@example.com',  'No me ha llegado ninguna confirmación después de enviar.',            2),
  ('Sara Muestra',  'sara@example.com',   'Todo bien, pero el botón de enviar se ve poco.',                      null);

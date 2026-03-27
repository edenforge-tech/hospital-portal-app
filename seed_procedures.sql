UPDATE counseling_sessions
SET recommended_procedures = '[{"eye":"RE","surgeryTypeId":"312638d7-bac4-471d-8ef5-5872c376a28e","surgeryName":"Cataract Surgery (Phacoemulsification)","surgeryCategory":"Cataract","requiresIol":true,"iclProcedure":false,"laserProcedure":false},{"eye":"LE","surgeryTypeId":"312638d7-bac4-471d-8ef5-5872c376a28e","surgeryName":"Cataract Surgery (Phacoemulsification)","surgeryCategory":"Cataract","requiresIol":true,"iclProcedure":false,"laserProcedure":false}]'
WHERE id = '11111111-0000-0000-0000-000000000001';

UPDATE counseling_sessions
SET recommended_procedures = '[{"eye":"RE","surgeryTypeId":"312638d7-bac4-471d-8ef5-5872c376a28e","surgeryName":"LASIK Surgery","surgeryCategory":"Refractive","requiresIol":false,"iclProcedure":false,"laserProcedure":true},{"eye":"LE","surgeryTypeId":"312638d7-bac4-471d-8ef5-5872c376a28e","surgeryName":"LASIK Surgery","surgeryCategory":"Refractive","requiresIol":false,"iclProcedure":false,"laserProcedure":true}]'
WHERE id = '11111111-0000-0000-0000-000000000002';

UPDATE counseling_sessions
SET recommended_procedures = '[{"eye":"RE","surgeryTypeId":"312638d7-bac4-471d-8ef5-5872c376a28e","surgeryName":"Vitreoretinal Surgery","surgeryCategory":"Vitreoretinal","requiresIol":false,"iclProcedure":false,"laserProcedure":false}]'
WHERE id = '11111111-0000-0000-0000-000000000003';

SELECT id, LEFT(recommended_surgery, 30) as surgery, recommended_procedures IS NOT NULL as has_proc
FROM counseling_sessions
WHERE id IN (
  '11111111-0000-0000-0000-000000000001',
  '11111111-0000-0000-0000-000000000002',
  '11111111-0000-0000-0000-000000000003'
);

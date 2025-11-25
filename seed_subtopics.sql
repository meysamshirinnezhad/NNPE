-- Seed SubTopics
WITH t AS (SELECT id, code FROM topics)
INSERT INTO sub_topics (topic_id, name, code, description, "order", created_at, updated_at) VALUES
((SELECT id FROM t WHERE code='A'),'Professional Role','A1','Duty to society, client, employer',1,now(),now()),
((SELECT id FROM t WHERE code='A'),'Self-Regulation','A2','Licensure, scope, discipline',2,now(),now()),
((SELECT id FROM t WHERE code='B'),'Ethical Principles','B1','Integrity, honesty, fairness',1,now(),now()),
((SELECT id FROM t WHERE code='B'),'Conflicts of Interest','B2','Disclosure, avoidance, management',2,now(),now())
ON CONFLICT DO NOTHING;
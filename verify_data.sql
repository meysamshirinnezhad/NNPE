-- Verify Topics
SELECT id, code, name, weight, "order" FROM topics ORDER BY "order";

-- Verify SubTopics
SELECT st.id, st.code, st.name, t.code as topic_code, st."order" 
FROM sub_topics st 
JOIN topics t ON st.topic_id = t.id 
ORDER BY t."order", st."order";
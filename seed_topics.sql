-- Seed Topics
INSERT INTO topics (name, code, description, weight, "order", created_at, updated_at) VALUES
('Professionalism','A','Role of the profession, public interest, self-regulation',25,1,now(),now()),
('Ethics','B','Ethical theories, codes, conflicts of interest',25,2,now(),now()),
('Professional Practice','C','Duty of care, QA/QC, documentation, stamps',20,3,now(),now()),
('Law for Practice','D','Contracts, torts, negligence, IP',20,4,now(),now()),
('Regulation & Liability','E','Discipline, enforcement, liability and insurance',10,5,now(),now())
ON CONFLICT DO NOTHING;
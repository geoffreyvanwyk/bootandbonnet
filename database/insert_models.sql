INSERT INTO models (name, manufacturerId)
	SELECT t.Model, m.id
		FROM temporary_models t
		INNER JOIN manufacturers m
		WHERE t.Make = m.name; 

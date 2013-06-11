INSERT INTO models (name, manufacturer_id)
	SELECT t.Model, m.id
		FROM temporary_models t
		INNER JOIN manufacturers m
		WHERE t.Make = m.name; 

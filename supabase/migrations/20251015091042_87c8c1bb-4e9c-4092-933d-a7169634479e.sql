-- Add company, industry, and company website fields to transformations table
ALTER TABLE transformations
ADD COLUMN company text,
ADD COLUMN industry text,
ADD COLUMN company_website text;
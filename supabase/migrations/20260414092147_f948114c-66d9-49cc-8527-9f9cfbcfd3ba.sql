-- Add unique constraint to prevent duplicate linking
ALTER TABLE public.membership_card_loyalty_programs
ADD CONSTRAINT unique_card_program_link
UNIQUE (membership_card_id, loyalty_program_type, loyalty_program_record_id);

-- Add trigger for automatic timestamp updates (reuse existing function)
CREATE TRIGGER update_membership_card_loyalty_programs_updated_at
BEFORE UPDATE ON public.membership_card_loyalty_programs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
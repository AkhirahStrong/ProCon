import { supabase } from '../lib/supabase';

export default async function handler(req, res) {
  const ip = '123.123.123.123';  // fake test ip
  const today = new Date().toDateString();

  const { error } = await supabase
    .from('ip_limit')
    .insert([{ ip, count: 1, last_reset: today }]);

  if (error) {
    console.error("Supabase Insert Error:", error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ message: 'Insert worked!' });
}

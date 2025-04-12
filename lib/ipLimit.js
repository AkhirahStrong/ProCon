import { supabase } from './supabase.js'

const IP_LIMIT = 10;

export async function checkIpLimit(ip) {
  const today = new Date().toDateString();

  // Check if IP exists
  const { data, error } = await supabase
    .from('ip_limit')
    .select('*')
    .eq('ip', ip)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Supabase Error:", error);
    return false;
  }

  // No record found → Insert new
  if (!data) {
    const { error: insertError } = await supabase
      .from('ip_limit')
      .insert([{ ip, count: 1, last_reset: today }]);

    if (insertError) {
      console.error("Insert Error:", insertError);
      return false;
    }

    return true;
  }

  // Reset daily limit
  if (data.last_reset !== today) {
    const { error: resetError } = await supabase
      .from('ip_limit')
      .update({ count: 1, last_reset: today })
      .eq('ip', ip);

    if (resetError) {
      console.error("Reset Error:", resetError);
      return false;
    }

    return true;
  }

  // Allow if under limit
  if (data.count < IP_LIMIT) {
    const { error: updateError } = await supabase
      .from('ip_limit')
      .update({ count: data.count + 1 })
      .eq('ip', ip);

    if (updateError) {
      console.error("Update Error:", updateError);
      return false;
    }

    return true;
  }

  // Over limit
  return false;
}

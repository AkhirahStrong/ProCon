import { supabase } from './supabase';

const IP_LIMIT = 10;

export async function checkIpLimit(ip) {
  const today = new Date().toDateString();

  const { data, error } = await supabase
    .from('ip_limit')
    .select('*')
    .eq('ip', ip)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Supabase Error:", error);
    return false;
  }

  if (!data) {
    await supabase.from('ip_limit').insert([{ ip, count: 1, last_reset: today }]);
    return true;
  }

  if (data.last_reset !== today) {
    await supabase.from('ip_limit')
      .update({ count: 1, last_reset: today })
      .eq('ip', ip);
    return true;
  }

  if (data.count < IP_LIMIT) {
    await supabase.from('ip_limit')
      .update({ count: data.count + 1 })
      .eq('ip', ip);
    return true;
  }

  if (!data) {
    const { error: insertError } = await supabase
      .from('ip_limit')
      .insert([{ ip, count: 1, last_reset: today }]);
  
    if (insertError) {
      console.error("Insert Error:", insertError);
      return false;  // fail gracefully
    }
  
    return true;  // insert worked
  }
  

  return false;
}

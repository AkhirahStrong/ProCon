import { supabase } from './supabase.js'

// Max number of uses allowed per IP per day
const IP_LIMIT = 10;

// Function to check if an IP is allowed to use the tool
export async function checkIpLimit(ip) {

// check data tablee
console.log("CHECKING IP LIMIT FOR:", ip);



  // Get today's date (resets daily limits at midnight)
  const today = new Date().toDateString();

  // Try to find this IP in the database
  const { data, error } = await supabase
    .from('ip_limit')      // from this table
    .select('*')           // get all columns
    .eq('ip', ip)          // where ip matches
    .single();             // only return 1 row

    console.log("SELECT Result:", { data, error });
  

  // If Supabase throws an unexpected error
  if (error && error.code !== 'PGRST116') {
    console.error("Supabase Select Error:", error);
    return false;  // block usage
  }

  // If no record found → this IP is new today
  if (!data) {
    const { error: insertError } = await supabase

      .from('ip_limit')
      .insert([{ ip, count: 1, last_reset: today }]);  // Insert fresh record

    if (insertError) {
      console.error("Supabase Insert Error:", insertError);
      return false;  // block usage
    }

    return true;  // allowed to proceed
  }

  // If record exists but it's from a previous day → reset their count
  if (data.last_reset !== today) {
    const { error: resetError } = await supabase
      .from('ip_limit')
      .update({ count: 1, last_reset: today })  // reset count to 1
      .eq('ip', ip);

    if (resetError) {
      console.error("Supabase Reset Error:", resetError);
      return false;  // block usage
    }

    return true;  // allowed to proceed
  }

  // If user is under the daily limit → allow + increment count
  if (data.count < IP_LIMIT) {
    const { error: updateError } = await supabase
      .from('ip_limit')
      .update({ count: data.count + 1 })  // add 1 to count
      .eq('ip', ip);

    if (updateError) {
      console.error("Supabase Update Error:", updateError);
      return false;  // block usage
    }

    return true;  // allowed to proceed
  }

  console.warn("IP Over Limit");


  // If none of the above → they've hit the limit
  return false;  // blocked
}

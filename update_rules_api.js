const http = require('http');

const defaultPortalRules = [
  { id: 'p1', title: '1. Use of Authentic Credentials Only', desc: 'Access to this digital portal is strictly restricted to your authorized @college.edu institutional email address. Do not attempt to register secondary accounts or use personal email addresses. Doing so will result in an automatic account suspension.' },
  { id: 'p2', title: '2. Strict Parent Account Linking Protocols', desc: 'You must ensure your correct parent or guardian email is registered in the system for outpass approvals. Falsifying parent emails, creating fake proxy accounts, or approving your own outpasses is considered a severe disciplinary offense.' },
  { id: 'p3', title: '3. Maintaining Profile Accuracy', desc: 'It is the student\'s responsibility to keep their emergency contact numbers, blood group, and allocated room details updated in the Profile section. Outpass applications may be automatically rejected by the system if the profile data is found to be incomplete or mismatched.' },
  { id: 'p4', title: '4. Dynamic QR Gate Pass Integrity', desc: 'Do not screenshot, screen-record, or share your QR gate passes. The QR codes rotate dynamically every few seconds. Presenting an old or static screenshot at the security scanner will trigger an immediate security alert and block your exit.' },
  { id: 'p5', title: '5. Honesty in Leave Applications', desc: 'Providing false reasons, fabricated medical certificates, or fake destination addresses for leave applications will result in a permanent ban from using the digital portal. All applications are subject to random verification calls to parents.' },
  { id: 'p6', title: '6. Account Password Security', desc: 'You are required to change your access passkey every 90 days. Never share your password or OTPs with peers, seniors, or even administration staff. You are entirely responsible for any outpass generated from your logged-in session.' },
  { id: 'p7', title: '7. Mandatory Gate Scanning Protocol', desc: 'When entering or exiting the campus, you must physically present your own device to the security guard to scan the QR code. Tailgating behind another student without scanning your own pass will flag you as an unauthorized absconder.' },
  { id: 'p8', title: '8. Status Acknowledgement and Bulletins', desc: 'Students are expected to frequently check the Announcements tab. You must manually click and mark critical bulletins as "Read" to acknowledge receipt of important administrative notices. Ignorance of a published rule is not an acceptable excuse.' },
  { id: 'p9', title: '9. Automated Session Timeouts', desc: 'For your security, the portal will automatically log you out after 30 minutes of inactivity. If you are using a shared computer in the library or computer lab, you must ensure you manually log out and close the browser window.' },
  { id: 'p10', title: '10. Proper Issue Reporting Channels', desc: 'If you experience bugs, application crashes, or approval delays exceeding 48 hours, do not create duplicate outpass requests. Instead, raise a detailed technical ticket via the Support Hub tab so the IT team can resolve the underlying issue.' }
];

const defaultHostelRules = [
  { id: 'h1', title: '1. Strict Night Curfew Hours', desc: 'All campus borders, main gates, and hostel block entrances are strictly shut down at 8:30 PM every night without exception. Students attempting late entries will be denied access to the block and must wait in the security lounge. Repeated late entries will trigger automated disciplinary logs which are instantly emailed to registered parents or guardians.' },
  { id: 'h2', title: '2. Outpass Application Deadlines', desc: 'All outpass applications must be submitted through this digital portal at least 24 hours prior to the requested leave start time. This buffer period is mandatory to guarantee that the Chief Warden has adequate time to review the request, cross-check academic schedules, and issue an approval.' },
  { id: 'h3', title: '3. Mandatory Biometric Attendance Checks', desc: 'Biometric fingerprint scanning is actively enforced in all block lobbies from 9:00 PM to 9:30 PM daily. It is the absolute responsibility of the student to ensure their attendance is marked. Unmarked absences, even if the student is inside the room, will incur heavy penalty fines and a potential suspension of outpass privileges.' },
  { id: 'h4', title: '4. Enforcement of Silence Hours', desc: 'Strict silence must be maintained in all corridors, common rooms, and residential rooms from 10:00 PM to 6:00 AM. This policy respects the study and sleep schedules of all residents. Playing loud music, shouting across hallways, or gathering in large noisy groups during these hours will lead to confiscation of speakers and disciplinary action.' },
  { id: 'h5', title: '5. Comprehensive Visitor Policy', desc: 'Under no circumstances are outside visitors, including day-scholars and family members, permitted inside individual student rooms. All visitors must be registered at the main gate and can only be entertained in the designated ground-floor visitor lounges during approved visiting hours (4:00 PM to 7:00 PM).' },
  { id: 'h6', title: '6. Room Cleanliness and Maintenance', desc: 'Students are held responsible for the daily tidiness and hygiene of their allocated rooms. Surprise inspections are conducted weekly by the block wardens. Rooms found with accumulated garbage, unhygienic conditions, or damaged furniture will result in maintenance fines levied equally among the room\'s occupants.' },
  { id: 'h7', title: '7. Prohibition of Heavy Electrical Appliances', desc: 'To prevent severe fire hazards and power tripping, heavy electrical appliances such as induction stoves, room heaters, electric kettles, and irons are strictly prohibited in student rooms. Only laptops, mobile chargers, and small table lamps are permitted. Confiscated items will not be returned until the end of the semester.' },
  { id: 'h8', title: '8. Zero Tolerance for Contraband & Intoxicants', desc: 'The institution enforces a strict zero-tolerance policy for the possession, consumption, or distribution of alcohol, tobacco products, e-cigarettes, and illegal narcotic substances. Any discovery of such items during random sweeps will lead to immediate expulsion from the hostel and potential handover to local law enforcement.' },
  { id: 'h9', title: '9. Liability for Damage to Institutional Property', desc: 'Any intentional or accidental damage to institutional property—including corridor lighting, elevator buttons, lounge furniture, or bathroom fixtures—will result in repair costs being deducted directly from the responsible student\'s security deposit. If the culprit is unidentified, the fine is distributed across the entire floor.' },
  { id: 'h10', title: '10. Mandatory Dress Code in Common Areas', desc: 'Appropriate, modest, and clean casual wear must be worn at all times when outside the residential room. This includes all common areas, mess halls, sports facilities, and administrative offices. Nightwear and bathroom slippers are strictly prohibited in the dining hall.' },
  { id: 'h11', title: '11. Strict Mess Timings and Dining Etiquette', desc: 'Meals are freshly prepared and served only during strict pre-defined time slots (Breakfast: 7:30-9:00 AM, Lunch: 12:30-2:00 PM, Dinner: 7:30-9:00 PM). Taking mess utensils, plates, or prepared food into hostel rooms is considered theft and is strictly not allowed.' },
  { id: 'h12', title: '12. Overnight Leave Return Protocols', desc: 'When returning from an approved overnight or multi-day leave, students must scan their QR gate pass back into the campus before the 8:30 PM curfew on the designated end date. Failing to report back on time without extending the outpass online will flag the student as an unauthorized absentee.' },
  { id: 'h13', title: '13. Protocols for Medical Emergencies', desc: 'In the event of a severe illness or injury, students must immediately notify the block warden or utilize the 24/7 medical room located on the ground floor of Block A. The on-campus nurse will evaluate the situation and arrange for an ambulance to the partnered hospital if necessary.' },
  { id: 'h14', title: '14. Zero Tolerance Anti-Ragging Policy', desc: 'Ragging, bullying, hazing, or any form of physical or mental harassment is a severe criminal offense under state law. Perpetrators of such acts face immediate rustication from the college, permanent blacklisting, and a mandatory First Information Report (FIR) filed with the local police.' },
  { id: 'h15', title: '15. Room Key Security and Management', desc: 'Duplication of room keys by outside vendors is strictly forbidden and constitutes a major security breach. Lost keys must be reported to the Chief Warden desk immediately to arrange for a full lock replacement at the student\'s expense.' },
  { id: 'h16', title: '16. Safekeeping of Personal Valuables', desc: 'Students are solely responsible for the safety of their laptops, cash, jewelry, and other high-value items. Always double-lock your room and cupboards when stepping out, even for a few minutes. The institution assumes no liability for stolen or misplaced personal property.' },
  { id: 'h17', title: '17. Birthday Celebrations and Gatherings', desc: 'Birthday celebrations are permitted only in the designated common rooms and must conclude strictly by 11:30 PM. Smearing cake on walls, using party poppers that leave permanent stains, or causing property damage will result in heavy fines for the entire organizing group.' },
  { id: 'h18', title: '18. E-Commerce Deliveries & Parcels', desc: 'All e-commerce packages, mail, and food deliveries must be collected directly from the designated parcel drop-off zone at the main security gate before 8:00 PM. Delivery personnel are not allowed past the main gate under any circumstances.' },
  { id: 'h19', title: '19. Mandatory Resource Conservation', desc: 'As part of our green campus initiative, students must switch off all lights, fans, and electronics when leaving their room. Any leaking taps or running toilets must be reported to the maintenance desk via the Support Hub immediately to prevent water wastage.' },
  { id: 'h20', title: '20. Mandatory Fire Evacuation Drills', desc: 'Mandatory participation is required for all emergency fire drills conducted each semester. When the alarm sounds, students must leave all belongings, exit via the marked stairwells (do not use elevators), and assemble at the designated safe zone on the main sports ground.' }
];

async function updatePolicies(type, policies) {
  return new Promise((resolve, reject) => {
    // Generate a valid mock admin token (the mock backend middleware only checks if it's there usually, or we can use admin@college.edu)
    // The backend uses a hardcoded check or simple jwt. Since it's a mock, passing a random token might work, or we can login first.
    // Let's just bypass auth for the script by making it direct, or login.
    const req = http.request({
      hostname: 'localhost',
      port: 5005,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const token = JSON.parse(data).token;
        
        const putReq = http.request({
          hostname: 'localhost',
          port: 5005,
          path: '/public/policies',
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }, (res2) => {
          resolve();
        });
        putReq.write(JSON.stringify({ type, policies }));
        putReq.end();
      });
    });
    req.write(JSON.stringify({ email: 'admin@college.edu', password: 'password123', role: 'admin' }));
    req.end();
  });
}

async function run() {
  await updatePolicies('portal', defaultPortalRules);
  await updatePolicies('hostel', defaultHostelRules);
  console.log('Restored rules via API successfully');
}
run();

-- Casebook 2025 (indoor) + case video links.
--
-- Source: FIVB Volleyball Casebook 2025 (based on the 2025-2028 rules),
-- https://inside.cev.eu/media/n40ey4ap/casebook-2025.pdf
--
-- 1. Adds the 7 cases new in 2025 and replaces the text of the 4 cases the
--    2025 edition lists as modified (2.7, 3.11, 3.14, 3.19), with their rule
--    links. 3.11 flips from "No" to "Yes".
-- 2. Sets every indoor video link to the one in the 2025 casebook. Links go
--    to https://fivbacademy.com: the old http://www.fivbacademy.com form
--    breaks in browsers that force HTTPS (that host's certificate does not
--    cover www). Cases with two clips keep them comma-separated.
--
-- Beach needs no change: all 15 cases with video in the 2025 Illustrated
-- Beach Volleyball Casebook already carry the same Google Drive links.
--
-- Apply: npx wrangler d1 execute readvolley-db --remote --file=scripts/casebook-2025.sql

-- 1. New and modified cases
UPDATE casebook SET case_text = 'At the service hit, for the receiving team, the player in position 1 had the heel of his rear foot (relative to the centre line) level with the toe of the front foot of the position 2 player. How should the 2nd referee respond?', case_ruling = 'The 2nd referee should do nothing. This is a legal position according to the current rules 2025-28. The receiving team commits a positional fault, if the players are not in the correct rotational order at the moment the ball is hit by the server.
To try to reduce the number of positional calls by referees and to reflect the current reality of 2nd row players switching positions, referees in particular need only whistle if a back row player is completely in front of the corresponding front row player at the service hit. Feet on the ground determine the position.', rule_ref_text = 'Rules 1.3.3, 7.4.3.1, Refereeing Guidelines and Instructions Rule 7 Item 5', rule_reference_array = '["rules/Rule1_3_3_indoor", "rules/Rule7_4_3_1_indoor"]' WHERE id = '2_27_indoor';
DELETE FROM casebook_rules WHERE casebook_id = '2_27_indoor';
INSERT INTO casebook_rules (casebook_id, rule_id) VALUES ('2_27_indoor', 'Rule1_3_3_indoor');
INSERT INTO casebook_rules (casebook_id, rule_id) VALUES ('2_27_indoor', 'Rule7_4_3_1_indoor');

INSERT INTO casebook (id, case_number, case_text, case_ruling, video_link, case_section, case_subsection, chapter_n, chapter_name, document_type, rule_ref_text, rule_reference_array, rules_type, chapter_id) VALUES ('2_28_indoor', '2.8', 'In 2 different situations the 1st referee called twice positional fault at the serving team between the players in position 5 and 6. How should the 1st referee apply the current rules in this situation?', 'The 1st referee should let the game continue. According to the Rules 2025-28 this is a legal position for the serving team.
Note: the rule modification approved by FIVB Congress 2024 does not apply for the receiving team.', NULL, 'Playing Format', 'Positional And Rotational Faults', '2', 'Chapter 2', 'casebook', 'Rules 1.3.3, 7.4, 7.4.3.2, Refereeing Guidelines and Instructions Rule 7 Item 5', '["rules/Rule1_3_3_indoor", "rules/Rule7_4_indoor", "rules/Rule7_4_3_2_indoor"]', 'indoor', 'Chapter2_indoor');
DELETE FROM casebook_rules WHERE casebook_id = '2_28_indoor';
INSERT INTO casebook_rules (casebook_id, rule_id) VALUES ('2_28_indoor', 'Rule1_3_3_indoor');
INSERT INTO casebook_rules (casebook_id, rule_id) VALUES ('2_28_indoor', 'Rule7_4_indoor');
INSERT INTO casebook_rules (casebook_id, rule_id) VALUES ('2_28_indoor', 'Rule7_4_3_2_indoor');

UPDATE casebook SET case_text = 'Should the line judge signal when after the second or third hit of a team the ball crosses the net plane through the external space into the opponent''s free zone?', case_ruling = 'Yes, to judge this ball is the duty of the line judge.', rule_ref_text = 'Rules 8.4.1, 8.4.2, 9.1, 10.1.2, 10.1.2.1, 10.1.2.2, 29.2.1.3', rule_reference_array = '["rules/Rule8_4_1_indoor", "rules/Rule8_4_2_indoor", "rules/Rule9_1_indoor", "rules/Rule10_1_2_indoor", "rules/Rule10_1_2_1_indoor", "rules/Rule10_1_2_2_indoor", "rules/Rule29_2_1_3_indoor"]' WHERE id = '3_311_indoor';
DELETE FROM casebook_rules WHERE casebook_id = '3_311_indoor';
INSERT INTO casebook_rules (casebook_id, rule_id) VALUES ('3_311_indoor', 'Rule8_4_1_indoor');
INSERT INTO casebook_rules (casebook_id, rule_id) VALUES ('3_311_indoor', 'Rule8_4_2_indoor');
INSERT INTO casebook_rules (casebook_id, rule_id) VALUES ('3_311_indoor', 'Rule9_1_indoor');
INSERT INTO casebook_rules (casebook_id, rule_id) VALUES ('3_311_indoor', 'Rule10_1_2_indoor');
INSERT INTO casebook_rules (casebook_id, rule_id) VALUES ('3_311_indoor', 'Rule10_1_2_1_indoor');
INSERT INTO casebook_rules (casebook_id, rule_id) VALUES ('3_311_indoor', 'Rule10_1_2_2_indoor');
INSERT INTO casebook_rules (casebook_id, rule_id) VALUES ('3_311_indoor', 'Rule29_2_1_3_indoor');

UPDATE casebook SET case_text = 'A spiker landed on center line in a legal position, but the opponent''s blocker stepped on his feet, so prevented his ability to move. Is this interference?', case_ruling = 'Yes. This is interference.
Interference means a player stops an opponent from moving, or playing the ball, or disturbing the opponent while attempting to play the ball. Although both players had legal position on the center line, but one of them was interfered.', rule_ref_text = 'Rules 11.2.1, 11.2.2.1, 11.2.4', rule_reference_array = '["rules/Rule11_2_1_indoor", "rules/Rule11_2_2_1_indoor", "rules/Rule11_2_4_indoor"]' WHERE id = '3_314_indoor';
DELETE FROM casebook_rules WHERE casebook_id = '3_314_indoor';
INSERT INTO casebook_rules (casebook_id, rule_id) VALUES ('3_314_indoor', 'Rule11_2_1_indoor');
INSERT INTO casebook_rules (casebook_id, rule_id) VALUES ('3_314_indoor', 'Rule11_2_2_1_indoor');
INSERT INTO casebook_rules (casebook_id, rule_id) VALUES ('3_314_indoor', 'Rule11_2_4_indoor');

UPDATE casebook SET case_text = 'After a simultaneous contact above the plane of the net, the ball landed outside the court of team A. Who gets next service?', case_ruling = 'If the contact is truly simultaneous by opponents exactly above the net, or even if the contact is completely above the opponent''s court, play continues where both players have the right to play the ball and it lands outside a court, it is the fault of the team on the opposite side. Team A gets service.', rule_ref_text = 'Rules 9.1.2.2, 9.1.2.3', rule_reference_array = '["rules/Rule9_1_2_2_indoor", "rules/Rule9_1_2_3_indoor"]' WHERE id = '3_319_indoor';
DELETE FROM casebook_rules WHERE casebook_id = '3_319_indoor';
INSERT INTO casebook_rules (casebook_id, rule_id) VALUES ('3_319_indoor', 'Rule9_1_2_2_indoor');
INSERT INTO casebook_rules (casebook_id, rule_id) VALUES ('3_319_indoor', 'Rule9_1_2_3_indoor');

INSERT INTO casebook (id, case_number, case_text, case_ruling, video_link, case_section, case_subsection, chapter_n, chapter_name, document_type, rule_ref_text, rule_reference_array, rules_type, chapter_id) VALUES ('3_3275_indoor', '3.27.5', 'The spiked ball rebounded from the blockers to the spiker''s chest. In this moment the head of the spiker was above the height of the net. Then the ball went into the net, that was not enough taut and strongly moved. Based on challenge footage, it was proved, that one of the blockers contacted the net, that was moved due to the spiker''s playing the ball. Was the ruling correct by the referees?', 'Yes.
Making a proper decision 2 things should be considered.
1. Although the original action of the spiker was an attack, but he became a blocker after the ball rebounded from the opponent block. Because his head was still above the net, although the contact point was lower, he made a completed block. Therefore his next hit was legal, as first team hit.
2. Although one of the blockers hit the net, but if a ball is driven from the opposing side into the net and causes the net to touch the player, no fault is committed by the latter.', NULL, 'Playing Actions', 'Player At Or Contacting The Net', '3', 'Chapter 3', 'casebook', 'Rules 11.4.4', '["rules/Rule11_4_4_indoor"]', 'indoor', 'Chapter3_indoor');
DELETE FROM casebook_rules WHERE casebook_id = '3_3275_indoor';
INSERT INTO casebook_rules (casebook_id, rule_id) VALUES ('3_3275_indoor', 'Rule11_4_4_indoor');

INSERT INTO casebook (id, case_number, case_text, case_ruling, video_link, case_section, case_subsection, chapter_n, chapter_name, document_type, rule_ref_text, rule_reference_array, rules_type, chapter_id) VALUES ('3_3276_indoor', '3.27.6', 'Part 1: A player jumps at the net in what becomes a fake attack. He is not, therefore in immediate proximity to the ball. During his action, he contacts the opponent''s arm and pushed it to the net. Is this a fault?
Part 2: During the build up to an attack, the setter makes a one handed set – then the opponent blocker makes contact with the setter''s arm. Is this a fault?', 'Part 1: It was a behavior misleading the referees and opponent as well. Based on this the net touch by blocker cannot be counted as a fault. On the other hand, according to the Rulebook definition and Guidelines approach, the middle player''s action was not interference, because the opponent blocker was not about to play the ball, so he was not interfered. Therefore, because there was no fault in the action, the rally should be finished, then to penalize the middle player for rude conduct. (Rule 11.3.1)
Part 2: Contact with the opponent is not necessarily a fault - to be classed as interference, the player has to be hindered in or prevented from making a play on the ball. In this case described, the setter had already played the ball successfully, so no interference should be called here. (Rule 11.4.1)', NULL, 'Playing Actions', 'Player At Or Contacting The Net', '3', 'Chapter 3', 'casebook', 'Rules 11.3.1, 11.4.1', '["rules/Rule11_3_1_indoor", "rules/Rule11_4_1_indoor"]', 'indoor', 'Chapter3_indoor');
DELETE FROM casebook_rules WHERE casebook_id = '3_3276_indoor';
INSERT INTO casebook_rules (casebook_id, rule_id) VALUES ('3_3276_indoor', 'Rule11_3_1_indoor');
INSERT INTO casebook_rules (casebook_id, rule_id) VALUES ('3_3276_indoor', 'Rule11_4_1_indoor');

INSERT INTO casebook (id, case_number, case_text, case_ruling, video_link, case_section, case_subsection, chapter_n, chapter_name, document_type, rule_ref_text, rule_reference_array, rules_type, chapter_id) VALUES ('3_3311_indoor', '3.31.1', 'The served ball rips the middle of the net, then penetrated through the hole to the opponent court. How the game should continue?', 'The rally should be won by the receiving team.
The fault occurred is, that the served ball did not pass through the crossing space. The ripped net comes after this - hence there must be no replay.
Note: Rule 10.3.2 regarding damage to the net refers to actions taking place within a team''s three hits. A net with an obvious hole should be replaced before play begins.', NULL, 'Playing Actions', 'Service', '3', 'Chapter 3', 'casebook', 'Rules 8.4.4, 10.1.1, 12.6.2.1', '["rules/Rule8_4_4_indoor", "rules/Rule10_1_1_indoor", "rules/Rule12_6_2_1_indoor"]', 'indoor', 'Chapter3_indoor');
DELETE FROM casebook_rules WHERE casebook_id = '3_3311_indoor';
INSERT INTO casebook_rules (casebook_id, rule_id) VALUES ('3_3311_indoor', 'Rule8_4_4_indoor');
INSERT INTO casebook_rules (casebook_id, rule_id) VALUES ('3_3311_indoor', 'Rule10_1_1_indoor');
INSERT INTO casebook_rules (casebook_id, rule_id) VALUES ('3_3311_indoor', 'Rule12_6_2_1_indoor');

INSERT INTO casebook (id, case_number, case_text, case_ruling, video_link, case_section, case_subsection, chapter_n, chapter_name, document_type, rule_ref_text, rule_reference_array, rules_type, chapter_id) VALUES ('3_3312_indoor', '3.31.2', 'The 3 front row players of serving team grouped at the net. 1 of them raised highly his hand. The 1st referee called screen, then explained clearly his decision to the game captain. Was it a correct procedure?', 'Yes. According to the current screen rule approved by FIVB Congress 2024 any player of the serving team have no right to prevent the opponent from seeing the server and the path of the ball by raising hand(s) over the head until the ball passed the net. The position of the player raising hand is irrelevant from the path of the served ball.
The 1st referee can indicate to the involved player(s), but not obliged, that he/she should stop it. However, it is worth to first remind the players, what they may do during the service, then if it is ineffective, to call the screen fault.', NULL, 'Playing Actions', 'Service', '3', 'Chapter 3', 'casebook', 'Rules 12.5.3, Refereeing Guidelines and Instructions Rule 12 Item 5', '["rules/Rule12_5_3_indoor"]', 'indoor', 'Chapter3_indoor');
DELETE FROM casebook_rules WHERE casebook_id = '3_3312_indoor';
INSERT INTO casebook_rules (casebook_id, rule_id) VALUES ('3_3312_indoor', 'Rule12_5_3_indoor');

INSERT INTO casebook (id, case_number, case_text, case_ruling, video_link, case_section, case_subsection, chapter_n, chapter_name, document_type, rule_ref_text, rule_reference_array, rules_type, chapter_id) VALUES ('3_3351_indoor', '3.35.1', 'The Libero in the front zone played the ball with overhand fingers, then a team-mate completed an attack hit hitting the ball higher than the top band. The 1st referee judged the attack hit faulty, because of the Libero overhand fingers setting. Was it a correct decision?', 'Yes, because it was a faulty attack due to the Libero overhand fingers play in the front zone. In case, that the Libero has not to make a quick defending action preventing a strong ball hurt the face/body, but play it comfortably with overhand fingers, it should be considered as classical settings.', NULL, 'Playing Actions', 'Attack Hit', '3', 'Chapter 3', 'casebook', 'Rules 13.3.6, 19.3.1.4', '["rules/Rule13_3_6_indoor", "rules/Rule19_3_1_4_indoor"]', 'indoor', 'Chapter3_indoor');
DELETE FROM casebook_rules WHERE casebook_id = '3_3351_indoor';
INSERT INTO casebook_rules (casebook_id, rule_id) VALUES ('3_3351_indoor', 'Rule13_3_6_indoor');
INSERT INTO casebook_rules (casebook_id, rule_id) VALUES ('3_3351_indoor', 'Rule19_3_1_4_indoor');

INSERT INTO casebook (id, case_number, case_text, case_ruling, video_link, case_section, case_subsection, chapter_n, chapter_name, document_type, rule_ref_text, rule_reference_array, rules_type, chapter_id) VALUES ('5_527_indoor', '5.27', 'The Libero in the front zone played the ball with a classical overhand finger pass. In the moment of hit he stepped behind the attack line, meanwhile he lifted his other leg into the air. His teammate completed an attack by hitting the ball higher than the top of the net. The 1st referee judged the action as a fault and gave the rally to the opponent team. Was it a correct decision by him?', 'Yes. In such situation the last contact with the floor of the Libero is counted. This principle is used in case of the jump serve and back row attack too.
Although the left leg is in the air, but its last contact point was WITHIN the attack zone. Therefore making a complete attack on this ball, when is entirely higher than the top of the net in the moment of the hit, is a fault.', NULL, 'Libero', 'Libero', '5', 'Chapter 5', 'casebook', 'Rules 13.3.6, 19.3.1.4', '["rules/Rule13_3_6_indoor", "rules/Rule19_3_1_4_indoor"]', 'indoor', 'Chapter5_indoor');
DELETE FROM casebook_rules WHERE casebook_id = '5_527_indoor';
INSERT INTO casebook_rules (casebook_id, rule_id) VALUES ('5_527_indoor', 'Rule13_3_6_indoor');
INSERT INTO casebook_rules (casebook_id, rule_id) VALUES ('5_527_indoor', 'Rule19_3_1_4_indoor');

-- 2. Video links (89 clips over 87 cases)
UPDATE casebook SET video_link = NULL WHERE rules_type = 'indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/05_who%20is%20server%20IC.mp4' WHERE id = '1_14_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2025/case%201.5%20R1%20changes%20decision.mp4' WHERE id = '1_15_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/coach%20behavior%20unacceptable.mp4' WHERE id = '1_16_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/05_coach_inside_coaches_line.mp4' WHERE id = '1_18_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/assistant_coach_warms_in_interval.mp4' WHERE id = '1_110_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/USA_at_warming_up.mp4' WHERE id = '1_111_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2022/case%201_13_2.mp4' WHERE id = '1_1112_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2019_draft/videos/case%201_13_2_warm%20up%20with%20coach%20spiking%20the%20ball.mp4' WHERE id = '1_1113_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/jersey_numbers_over_20.mp4' WHERE id = '1_112_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/compression_pads_in_diff_colours.mp4' WHERE id = '1_114_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/5%20players%20on%20court%20in%20a%20rally.mp4' WHERE id = '2_24_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/foot%20out%20of%20court%20at%20service.mp4' WHERE id = '2_26_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2023/case_2_7_1_legal_play_5_6.mp4, https://fivbacademy.com/FIVB_elearning/casebook_2023/case_2_7_2_pos%20fault%20VI_I%20%20AND%20III_II.mp4' WHERE id = '2_27_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2025/case_2_8_correct_position_of_serving_team.mp4' WHERE id = '2_28_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2023/case%203.4%20%20catch%20during%20block.mp4' WHERE id = '3_34_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2023/case_3.5%20Catch%20And%20Throw.mp4' WHERE id = '3_35_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/labdamegjatszas%20kifuton%20kivulrol.mp4' WHERE id = '3_36_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/08_labda_kifuton_kivul_r1_mogott.mp4' WHERE id = '3_37_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2019_draft/videos/case%208_6_replay%20in%20opponent%20side%20over%20table.mp4' WHERE id = '3_310_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/Grbic.mp4' WHERE id = '3_313_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2019_draft/videos/EST%20POR%20case%203_11_1.mp4' WHERE id = '3_3131_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2019_draft/videos/case%203_11_2_ball%20hits%20sideband%20from%20blocker.mp4' WHERE id = '3_3132_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2023/case_13_3_3_%20ball_hit_sideband_not_antenna.mp4' WHERE id = '3_3133_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2023/case%2013_3_4%20ball%20through%20crossing%20space.mp4' WHERE id = '3_3134_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2025/case_3_14_penetration_with_interference.mp4' WHERE id = '3_314_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/penetration%20with%20body%20no%20interference.mp4' WHERE id = '3_316_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2023/case%203.17%20Player%20in%20pursuit%20under%20the%20net%20-%20Interference.mp4' WHERE id = '3_317_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2024/penetration%20under%20net%20jpn%20tha.mp4' WHERE id = '3_318_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/joust_then_OUT.mp4' WHERE id = '3_319_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2025/case_3_21_net_touch_after_action.mp4' WHERE id = '3_321_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/attacker%20hits%20the%20net%20without%20touching%20%20ball.mp4' WHERE id = '3_322_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/net%20touch%20out%20of%20antenna.mp4' WHERE id = '3_324_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/net%20touch%20with%20hair.mp4' WHERE id = '3_327_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/attacker%20drove%20block%20into%20net%20CB.mp4, https://fivbacademy.com/FIVB_elearning/casebook_2023/case_3_26_4_hitting%20the%20blocker%20hand%20after%20spiking.mp4' WHERE id = '3_3271_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/case_3.26.1_strange_net_touch_s3_21_20.mp4' WHERE id = '3_3272_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2019_draft/videos/Vincic%20scaring%20opponent%20case%203_26_3.mp4' WHERE id = '3_3273_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2019_draft/videos/deliberate_net_touch.mp4' WHERE id = '3_3274_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2025/3_27_5%20no%20faulty%20net%20touch.mp4' WHERE id = '3_3275_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2025/case%203_27_6.mp4' WHERE id = '3_3276_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/QAT_Mexico.mp4' WHERE id = '3_331_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2025/case%203_31_3_ripped%20net%20by%20served%20ball.mp4' WHERE id = '3_3311_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2025/case%203.31.2%20screen%20rule%20application.mp4' WHERE id = '3_3312_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/forearm%20attack%20blocked.mp4' WHERE id = '3_333_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2025/case%203.35.1%20Libero%20setting%20from%20front%20zone.mp4' WHERE id = '3_3351_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2019_draft/videos/perfect%20block%203_50.mp4' WHERE id = '3_348_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2019_draft/videos/Minas%20(BRA)%20vs%20Vakifbank%20(TUR)%20-%20hair%20touch%203_51.mp4' WHERE id = '3_349_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2024/Case%203.50%20-%20%20CHN_BEL%20Catch%20and%20Throw%20in%20block.mp4' WHERE id = '3_350_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2019_draft/videos/3_52_block%20or%20first%20team%20hit.mp4' WHERE id = '3_351_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2019_draft/videos/case%203_53%20knee%20hit%20in%20the%20opponent%20space.mp4' WHERE id = '3_352_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2019_draft/videos/case%203_54_block%20or%20not.mp4' WHERE id = '3_353_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2019_draft/videos/spike%20net%20block.mp4' WHERE id = '3_354_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2019_draft/videos/NED%20RUS%20s3%2017_19%20double%20sub%20but%20only%20one%20applied%204_1.mp4' WHERE id = '4_41_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2019_draft/videos/BUL_RUS_case%204_22_3.mp4' WHERE id = '4_43_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2022/case%204_8.mp4' WHERE id = '4_48_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/15_late_sub_IR.mp4' WHERE id = '4_420_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/rejected%20sub%20DW.mp4' WHERE id = '4_425_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/correct_multiple_sub.mp4' WHERE id = '4_426_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/VRCK%20-%20Kranj%20%20sub%20player%20in%20warm%20up%20shirt.mp4' WHERE id = '4_4261_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/15_substitution%20requests%20without%20a%20rally%20CB.mp4' WHERE id = '4_428_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/HUN_ROM_DW_CB.mp4' WHERE id = '4_429_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/17_bloody_nose_player.mp4' WHERE id = '4_431_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/Libero_injured_remains_on_court.mp4' WHERE id = '4_432_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/15_injury%20during%20substitution.mp4' WHERE id = '4_433_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/17_injury%20out%20of%20court.mp4' WHERE id = '4_435_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2023/case%204.36%20JPN%20NOT%20injury%20replay.mp4' WHERE id = '4_436_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2023/case%204.37%20Fake%20injury.mp4' WHERE id = '4_437_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2024/Case%204.43%20-%20Coach%20ends%20the%20match.mp4' WHERE id = '4_443_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/ball%20hits%20the%20TV%20camera%20brace.mp4' WHERE id = '4_444_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/shoe_is_out_4_40.mp4' WHERE id = '4_445_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/case_4.41_player_clashes_to_ref_chair.mp4' WHERE id = '4_446_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2023/case%204.47%20Fans%20on%20court.mp4' WHERE id = '4_447_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2019_draft/videos/second%20ball%20no%20interference%20case%204_42.mp4' WHERE id = '4_448_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2024/Poland%20vs.%20Ukraine%20s2%2014_17%20UKR%20coach%20kicks%20the%20ball.mp4' WHERE id = '4_449_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/19_substitute%20replaced%20by%20Libero.mp4' WHERE id = '5_55_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/late_Libero_replacement.mp4' WHERE id = '5_56_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/Libero_in_wrong_jersey.mp4' WHERE id = '5_524_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/Liberos_set_one_hand_with_fingers.mp4' WHERE id = '5_526_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2025/case%205.27%20Libero%20set%20in%20a%20tricky%20action.mp4' WHERE id = '5_527_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/video_case_6.05.mp4' WHERE id = '6_65_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2024/Case%206.9%20-%20R2%20Communication_%20Coach%20protest.mp4' WHERE id = '6_69_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2023/case%207.10%20R1%20calls%20positional%20fault%20at%20receiving%20team.mp4' WHERE id = '7_710_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2018_draft/videos/no_assisted_hit.mp4' WHERE id = '8_84_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2019_draft/videos/case%208_5_withdrawn%20sub%20after%20chall.mp4' WHERE id = '8_85_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2024/Case%208.6%20-%20Antenna%20fell%20down.mp4' WHERE id = '8_86_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2024/Case%209.5%20-%20Recovery%20under%20net.mp4' WHERE id = '9_95_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2023/case_9_7_faulty%20footage_correct%20R1.mp4' WHERE id = '9_98_indoor';
UPDATE casebook SET video_link = 'https://fivbacademy.com/FIVB_elearning/casebook_2023/case%209_8_cancelled%20challenge%20due%20to%20admitting%20player.mp4' WHERE id = '9_99_indoor';

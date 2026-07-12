// Auto-generated from Demboss plan CSVs (2026-07-09). Re-run `npm run seed-plans` after editing.

// 91 data plans
const DATA_PLANS = [
  { id: '9mobile-242', name: '1.5GB', duration: '30 days', network: '9MOBILE', costPrice: 750, sellingPrice: 750, providerPlanId: '242', planType: 'Corporate', active: true },
  { id: '9mobile-245', name: '10GB', duration: '30 days', network: '9MOBILE', costPrice: 4900, sellingPrice: 4900, providerPlanId: '245', planType: 'Corporate', active: true },
  { id: '9mobile-240', name: '1GB', duration: '30 days', network: '9MOBILE', costPrice: 495, sellingPrice: 490, providerPlanId: '240', planType: 'Corporate', active: true },
  { id: '9mobile-264', name: '2GB', duration: '30 days', network: '9MOBILE', costPrice: 1100, sellingPrice: 1100, providerPlanId: '264', planType: 'Corporate', active: true },
  { id: '9mobile-243', name: '3GB', duration: '30 days', network: '9MOBILE', costPrice: 1500, sellingPrice: 1500, providerPlanId: '243', planType: 'Corporate', active: true },
  { id: '9mobile-244', name: '4GB', duration: '30 days', network: '9MOBILE', costPrice: 1950, sellingPrice: 1950, providerPlanId: '244', planType: 'Corporate', active: true },
  { id: '9mobile-241', name: '500MB', duration: '30 days', network: '9MOBILE', costPrice: 250, sellingPrice: 250, providerPlanId: '241', planType: 'Corporate', active: true },
  { id: '9mobile-265', name: '5GB', duration: '30 days', network: '9MOBILE', costPrice: 2450, sellingPrice: 2450, providerPlanId: '265', planType: 'Corporate', active: true },
  { id: 'airtel-226', name: '100GB', duration: '30 days', network: 'AIRTEL', costPrice: 20150, sellingPrice: 20600, providerPlanId: '226', planType: 'Corporate', active: true },
  { id: 'airtel-261', name: '100GB Router Unlimited Ultra 20', duration: '30 days', network: 'AIRTEL', costPrice: 20000, sellingPrice: 21500, providerPlanId: '261', planType: 'Corporate', active: true },
  { id: 'airtel-222', name: '10GB', duration: '30 days', network: 'AIRTEL', costPrice: 4000, sellingPrice: 4100, providerPlanId: '222', planType: 'Corporate', active: true },
  { id: 'airtel-219', name: '1GB', duration: '30 days', network: 'AIRTEL', costPrice: 805, sellingPrice: 800, providerPlanId: '219', planType: 'Corporate', active: true },
  { id: 'airtel-223', name: '25GB', duration: '30 days', network: 'AIRTEL', costPrice: 8200, sellingPrice: 8200, providerPlanId: '223', planType: 'Corporate', active: true },
  { id: 'airtel-220', name: '2GB', duration: '30 days', network: 'AIRTEL', costPrice: 1500, sellingPrice: 1510, providerPlanId: '220', planType: 'Corporate', active: true },
  { id: 'airtel-224', name: '35GB', duration: '30 days', network: 'AIRTEL', costPrice: 10300, sellingPrice: 10500, providerPlanId: '224', planType: 'Corporate', active: true },
  { id: 'airtel-221', name: '3GB', duration: '30 days', network: 'AIRTEL', costPrice: 2050, sellingPrice: 2050, providerPlanId: '221', planType: 'Corporate', active: true },
  { id: 'airtel-258', name: '4GB', duration: '30 days', network: 'AIRTEL', costPrice: 2545, sellingPrice: 2550, providerPlanId: '258', planType: 'Corporate', active: true },
  { id: 'airtel-218', name: '500MB', duration: '30 days', network: 'AIRTEL', costPrice: 505, sellingPrice: 500, providerPlanId: '218', planType: 'Corporate', active: true },
  { id: 'airtel-225', name: '60GB', duration: '30 days', network: 'AIRTEL', costPrice: 15150, sellingPrice: 15400, providerPlanId: '225', planType: 'Corporate', active: true },
  { id: 'airtel-262', name: 'Router Unlimited 20MBPS Data', duration: '30 days', network: 'AIRTEL', costPrice: 30500, sellingPrice: 31500, providerPlanId: '262', planType: 'Corporate', active: true },
  { id: 'airtel-216', name: '10GB', duration: '30 days', network: 'AIRTEL', costPrice: 4000, sellingPrice: 4000, providerPlanId: '216', planType: 'Gifting', active: true },
  { id: 'airtel-280', name: '1.5GB', duration: '1 day', network: 'AIRTEL', costPrice: 515, sellingPrice: 515, providerPlanId: '280', planType: 'SME', active: true },
  { id: 'airtel-282', name: '1.5GB', duration: '7 days', network: 'AIRTEL', costPrice: 525, sellingPrice: 525, providerPlanId: '282', planType: 'SME', active: true },
  { id: 'airtel-279', name: '1.5GB', duration: '1 day', network: 'AIRTEL', costPrice: 415, sellingPrice: 415, providerPlanId: '279', planType: 'SME', active: true },
  { id: 'airtel-208', name: '10GB', duration: '30 days', network: 'AIRTEL', costPrice: 3030, sellingPrice: 3450, providerPlanId: '208', planType: 'SME', active: true },
  { id: 'airtel-209', name: '150MB', duration: '1 day', network: 'AIRTEL', costPrice: 70, sellingPrice: 100, providerPlanId: '209', planType: 'SME', active: true },
  { id: 'airtel-281', name: '1GB', duration: '3 days', network: 'AIRTEL', costPrice: 310, sellingPrice: 310, providerPlanId: '281', planType: 'SME', active: true },
  { id: 'airtel-256', name: '1GB', duration: '1 day', network: 'AIRTEL', costPrice: 520, sellingPrice: 550, providerPlanId: '256', planType: 'SME', active: true },
  { id: 'airtel-253', name: '2GB', duration: '2 days', network: 'AIRTEL', costPrice: 670, sellingPrice: 700, providerPlanId: '253', planType: 'SME', active: true },
  { id: 'airtel-257', name: '3.5GB', duration: '7 days', network: 'AIRTEL', costPrice: 1600, sellingPrice: 1650, providerPlanId: '257', planType: 'SME', active: true },
  { id: 'airtel-210', name: '300MB', duration: '2 days', network: 'AIRTEL', costPrice: 120, sellingPrice: 150, providerPlanId: '210', planType: 'SME', active: true },
  { id: 'airtel-212', name: '3GB', duration: '7 days', network: 'AIRTEL', costPrice: 800, sellingPrice: 900, providerPlanId: '212', planType: 'SME', active: true },
  { id: 'airtel-283', name: '5GB', duration: '7 days', network: 'AIRTEL', costPrice: 1550, sellingPrice: 1550, providerPlanId: '283', planType: 'SME', active: true },
  { id: 'airtel-217', name: '5GB', duration: '7 days', network: 'AIRTEL', costPrice: 2600, sellingPrice: 2600, providerPlanId: '217', planType: 'SME', active: true },
  { id: 'airtel-211', name: '600MB', duration: '3 days', network: 'AIRTEL', costPrice: 225, sellingPrice: 230, providerPlanId: '211', planType: 'SME', active: true },
  { id: 'airtel-215', name: '60GB', duration: '60 days', network: 'AIRTEL', costPrice: 10550, sellingPrice: 11000, providerPlanId: '215', planType: 'SME', active: true },
  { id: 'airtel-214', name: '8GB', duration: '30 days', network: 'AIRTEL', costPrice: 2050, sellingPrice: 2250, providerPlanId: '214', planType: 'SME', active: true },
  { id: 'glo-234', name: '10GB', duration: '30 days', network: 'GLO', costPrice: 4300, sellingPrice: 4300, providerPlanId: '234', planType: 'Corporate', active: true },
  { id: 'glo-230', name: '1GB', duration: '30 days', network: 'GLO', costPrice: 450, sellingPrice: 450, providerPlanId: '230', planType: 'Corporate', active: true },
  { id: 'glo-228', name: '1GB', duration: '7 days', network: 'GLO', costPrice: 340, sellingPrice: 340, providerPlanId: '228', planType: 'Corporate', active: true },
  { id: 'glo-227', name: '1GB', duration: '3 days', network: 'GLO', costPrice: 285, sellingPrice: 285, providerPlanId: '227', planType: 'Corporate', active: true },
  { id: 'glo-231', name: '2GB', duration: '30 days', network: 'GLO', costPrice: 850, sellingPrice: 850, providerPlanId: '231', planType: 'Corporate', active: true },
  { id: 'glo-232', name: '3GB', duration: '3 days', network: 'GLO', costPrice: 1050, sellingPrice: 1050, providerPlanId: '232', planType: 'Corporate', active: true },
  { id: 'glo-255', name: '500MB', duration: '30 days', network: 'GLO', costPrice: 225, sellingPrice: 225, providerPlanId: '255', planType: 'Corporate', active: true },
  { id: 'glo-233', name: '5GB', duration: '30 days', network: 'GLO', costPrice: 2150, sellingPrice: 2150, providerPlanId: '233', planType: 'Corporate', active: true },
  { id: 'glo-235', name: '1.5GB', duration: '1 day', network: 'GLO', costPrice: 300, sellingPrice: 300, providerPlanId: '235', planType: 'SME', active: true },
  { id: 'glo-237', name: '10GB', duration: '7 days', network: 'GLO', costPrice: 1970, sellingPrice: 2000, providerPlanId: '237', planType: 'SME', active: true },
  { id: 'glo-236', name: '2.5GB', duration: '2 days', network: 'GLO', costPrice: 495, sellingPrice: 495, providerPlanId: '236', planType: 'SME', active: true },
  { id: 'glo-239', name: '750MB', duration: '1 day', network: 'GLO', costPrice: 198, sellingPrice: 198, providerPlanId: '239', planType: 'SME', active: true },
  { id: 'mtn-172', name: '1GB', duration: '7 days', network: 'MTN', costPrice: 410, sellingPrice: 550, providerPlanId: '172', planType: 'Corporate', active: true },
  { id: 'mtn-250', name: '20GB', duration: '30 days', network: 'MTN', costPrice: 7400, sellingPrice: 7500, providerPlanId: '250', planType: 'Corporate', active: true },
  { id: 'mtn-181', name: '2GB', duration: '7 days', network: 'MTN', costPrice: 850, sellingPrice: 1100, providerPlanId: '181', planType: 'Corporate', active: true },
  { id: 'mtn-182', name: '3GB', duration: '7 days', network: 'MTN', costPrice: 1350, sellingPrice: 1350, providerPlanId: '182', planType: 'Corporate', active: true },
  { id: 'mtn-179', name: '500MB', duration: '7 days', network: 'MTN', costPrice: 300, sellingPrice: 350, providerPlanId: '179', planType: 'Corporate', active: true },
  { id: 'mtn-269', name: '5GB', duration: '30 days', network: 'MTN', costPrice: 2100, sellingPrice: 2100, providerPlanId: '269', planType: 'Corporate', active: true },
  { id: 'mtn-183', name: '5GB', duration: '7 days', network: 'MTN', costPrice: 2000, sellingPrice: 2000, providerPlanId: '183', planType: 'Corporate', active: true },
  { id: 'mtn-193', name: '1.5GB', duration: '2 days', network: 'MTN', costPrice: 630, sellingPrice: 650, providerPlanId: '193', planType: 'Gifting', active: true },
  { id: 'mtn-197', name: '10GB + 15mins', duration: '30 days', network: 'MTN', costPrice: 4600, sellingPrice: 4650, providerPlanId: '197', planType: 'Gifting', active: true },
  { id: 'mtn-198', name: '110MB', duration: '1 day', network: 'MTN', costPrice: 110, sellingPrice: 115, providerPlanId: '198', planType: 'Gifting', active: true },
  { id: 'mtn-185', name: '11GB', duration: '7 days', network: 'MTN', costPrice: 3550, sellingPrice: 3600, providerPlanId: '185', planType: 'Gifting', active: true },
  { id: 'mtn-206', name: '1GB', duration: '30 days', network: 'MTN', costPrice: 790, sellingPrice: 795, providerPlanId: '206', planType: 'Gifting', active: true },
  { id: 'mtn-186', name: '1GB + 5mins', duration: '1 day', network: 'MTN', costPrice: 495, sellingPrice: 505, providerPlanId: '186', planType: 'Gifting', active: true },
  { id: 'mtn-189', name: '200GB', duration: '60 days', network: 'MTN', costPrice: 44200, sellingPrice: 45500, providerPlanId: '189', planType: 'Gifting', active: true },
  { id: 'mtn-249', name: '20GB', duration: '30 days', network: 'MTN', costPrice: 7500, sellingPrice: 7500, providerPlanId: '249', planType: 'Gifting', active: true },
  { id: 'mtn-203', name: '20GB', duration: '30 days', network: 'MTN', costPrice: 7530, sellingPrice: 7550, providerPlanId: '203', planType: 'Gifting', active: true },
  { id: 'mtn-199', name: '230MB', duration: '1 day', network: 'MTN', costPrice: 215, sellingPrice: 220, providerPlanId: '199', planType: 'Gifting', active: true },
  { id: 'mtn-196', name: '25GB', duration: '30 days', network: 'MTN', costPrice: 9150, sellingPrice: 9200, providerPlanId: '196', planType: 'Gifting', active: true },
  { id: 'mtn-192', name: '2GB', duration: '2 days', network: 'MTN', costPrice: 830, sellingPrice: 850, providerPlanId: '192', planType: 'Gifting', active: true },
  { id: 'mtn-200', name: '2GB', duration: '30 days', network: 'MTN', costPrice: 1530, sellingPrice: 1550, providerPlanId: '200', planType: 'Gifting', active: true },
  { id: 'mtn-201', name: '3.5GB', duration: '30 days', network: 'MTN', costPrice: 1750, sellingPrice: 2000, providerPlanId: '201', planType: 'Gifting', active: true },
  { id: 'mtn-184', name: '500MB', duration: '2 days', network: 'MTN', costPrice: 380, sellingPrice: 380, providerPlanId: '184', planType: 'Gifting', active: true },
  { id: 'mtn-191', name: '500MB', duration: '7 days', network: 'MTN', costPrice: 495, sellingPrice: 500, providerPlanId: '191', planType: 'Gifting', active: true },
  { id: 'mtn-187', name: '6GB', duration: '7 days', network: 'MTN', costPrice: 2550, sellingPrice: 2600, providerPlanId: '187', planType: 'Gifting', active: true },
  { id: 'mtn-207', name: '750MB', duration: '3 days', network: 'MTN', costPrice: 450, sellingPrice: 450, providerPlanId: '207', planType: 'Gifting', active: true },
  { id: 'mtn-188', name: '75GB', duration: '30 days', network: 'MTN', costPrice: 18200, sellingPrice: 18500, providerPlanId: '188', planType: 'Gifting', active: true },
  { id: 'mtn-194', name: '75MB', duration: '1 day', network: 'MTN', costPrice: 95, sellingPrice: 100, providerPlanId: '194', planType: 'Gifting', active: true },
  { id: 'mtn-202', name: '7GB', duration: '30 days', network: 'MTN', costPrice: 3530, sellingPrice: 3550, providerPlanId: '202', planType: 'Gifting', active: true },
  { id: 'mtn-286', name: '10GB', duration: '30 days', network: 'MTN', costPrice: 3500, sellingPrice: 3500, providerPlanId: '286', planType: 'SME', active: true },
  { id: 'mtn-275', name: '1GB', duration: '1 day', network: 'MTN', costPrice: 250, sellingPrice: 250, providerPlanId: '275', planType: 'SME', active: true },
  { id: 'mtn-284', name: '1GB', duration: '1 day', network: 'MTN', costPrice: 230, sellingPrice: 230, providerPlanId: '284', planType: 'SME', active: true },
  { id: 'mtn-171', name: '1GB', duration: '7 days', network: 'MTN', costPrice: 410, sellingPrice: 420, providerPlanId: '171', planType: 'SME', active: true },
  { id: 'mtn-274', name: '2.5GB', duration: '1 day', network: 'MTN', costPrice: 600, sellingPrice: 600, providerPlanId: '274', planType: 'SME', active: true },
  { id: 'mtn-285', name: '2GB', duration: '1 day', network: 'MTN', costPrice: 450, sellingPrice: 450, providerPlanId: '285', planType: 'SME', active: true },
  { id: 'mtn-175', name: '2GB', duration: '7 days', network: 'MTN', costPrice: 850, sellingPrice: 900, providerPlanId: '175', planType: 'SME', active: true },
  { id: 'mtn-276', name: '2GB', duration: '1 day', network: 'MTN', costPrice: 600, sellingPrice: 600, providerPlanId: '276', planType: 'SME', active: true },
  { id: 'mtn-176', name: '3GB', duration: '7 days', network: 'MTN', costPrice: 1300, sellingPrice: 1300, providerPlanId: '176', planType: 'SME', active: true },
  { id: 'mtn-277', name: '3GB', duration: '1 day', network: 'MTN', costPrice: 750, sellingPrice: 750, providerPlanId: '277', planType: 'SME', active: true },
  { id: 'mtn-173', name: '500MB', duration: '7 days', network: 'MTN', costPrice: 310, sellingPrice: 320, providerPlanId: '173', planType: 'SME', active: true },
  { id: 'mtn-177', name: '5GB', duration: '7 days', network: 'MTN', costPrice: 1700, sellingPrice: 1800, providerPlanId: '177', planType: 'SME', active: true },
  { id: 'mtn-278', name: '5GB', duration: '14 days', network: 'MTN', costPrice: 1400, sellingPrice: 1400, providerPlanId: '278', planType: 'SME', active: true },
  { id: 'mtn-268', name: '5GB', duration: '30 days', network: 'MTN', costPrice: 1750, sellingPrice: 1900, providerPlanId: '268', planType: 'SME', active: true },
]

// 15 cable plans
const CABLE_PLANS = [
  { id: 'dstv-57', name: 'DStv Confam + ExtraView - 1 month', provider: 'dstv', costPrice: 17100, sellingPrice: 17100, providerPlanId: '57', active: true },
  { id: 'dstv-59', name: 'DStv Padi + ExtraView  - 1 month', provider: 'dstv', costPrice: 10500, sellingPrice: 10500, providerPlanId: '59', active: true },
  { id: 'dstv-56', name: 'DStv Premium-French - 1 month', provider: 'dstv', costPrice: 69200, sellingPrice: 69200, providerPlanId: '56', active: true },
  { id: 'dstv-58', name: 'DStv Yanga + ExtraView - 1 month', provider: 'dstv', costPrice: 12100, sellingPrice: 12100, providerPlanId: '58', active: true },
  { id: 'gotv-48', name: 'GOtv Jinja - 1 month', provider: 'gotv', costPrice: 3980, sellingPrice: 4000, providerPlanId: '48', active: true },
  { id: 'gotv-50', name: 'GOtv Jolli - 1 month', provider: 'gotv', costPrice: 5900, sellingPrice: 5900, providerPlanId: '50', active: true },
  { id: 'gotv-51', name: 'GOtv Max - 1 month', provider: 'gotv', costPrice: 8650, sellingPrice: 8700, providerPlanId: '51', active: true },
  { id: 'gotv-47', name: 'GOtv Smallie - 1 month', provider: 'gotv', costPrice: 1950, sellingPrice: 1950, providerPlanId: '47', active: true },
  { id: 'showmax-60', name: 'Showmax Full - 1 Day', provider: 'showmax', costPrice: 3550, sellingPrice: 3550, providerPlanId: '60', active: true },
  { id: 'showmax-61', name: 'Showmax Full - 3 Days', provider: 'showmax', costPrice: 8500, sellingPrice: 8500, providerPlanId: '61', active: true },
  { id: 'startimes-52', name: 'Basic (Antenna) - 1 month', provider: 'startimes', costPrice: 4100, sellingPrice: 4100, providerPlanId: '52', active: true },
  { id: 'startimes-53', name: 'Basic (Dish) - 1 month', provider: 'startimes', costPrice: 5200, sellingPrice: 5200, providerPlanId: '53', active: true },
  { id: 'startimes-54', name: 'Classic (Antenna) - 1 month', provider: 'startimes', costPrice: 6100, sellingPrice: 6100, providerPlanId: '54', active: true },
  { id: 'startimes-49', name: 'Nova (Dish) - 1 month', provider: 'startimes', costPrice: 2170, sellingPrice: 2200, providerPlanId: '49', active: true },
  { id: 'startimes-55', name: 'Super (Dish) - 1 month', provider: 'startimes', costPrice: 9900, sellingPrice: 9900, providerPlanId: '55', active: true },
]

// 11 electricity discos
const ELECTRICITY_PROVIDERS = [
  { key: 'abuja', name: 'Abuja Electric', providerId: 8, abbr: 'AEDC' }, // -> disco_name sent to API: 'Abuja Electric'
  { key: 'benin', name: 'Benin Electric', providerId: 10, abbr: 'BENIN' }, // -> disco_name sent to API: 'Benin Electric'
  { key: 'eko', name: 'Eko Electric', providerId: 2, abbr: 'EKEDC' }, // -> disco_name sent to API: 'Eko Electric'
  { key: 'enugu', name: 'Enugu Electric', providerId: 9, abbr: 'ENUGU' }, // -> disco_name sent to API: 'Enugu Electric'
  { key: 'ibadan', name: 'Ibadan Electric', providerId: 6, abbr: 'IBEDC' }, // -> disco_name sent to API: 'Ibadan Electric'
  { key: 'ikeja', name: 'Ikeja Electric', providerId: 1, abbr: 'IE' }, // -> disco_name sent to API: 'Ikeja Electric'
  { key: 'jos', name: 'Jos Electric', providerId: 5, abbr: 'JED' }, // -> disco_name sent to API: 'Jos Electric'
  { key: 'kaduna', name: 'Kaduna Electric', providerId: 7, abbr: 'KEDC' }, // -> disco_name sent to API: 'Kaduna Electric'
  { key: 'kano', name: 'Kano Electric', providerId: 3, abbr: 'KEDCO' }, // -> disco_name sent to API: 'Kano Electric'
  { key: 'portharcourt', name: 'Port Harcourt Electric', providerId: 4, abbr: 'PHEDC' }, // -> disco_name sent to API: 'Port Harcourt Electric'
  { key: 'yola', name: 'Yola Electric', providerId: 11, abbr: 'YOLA' }, // -> disco_name sent to API: 'Yola Electric'
]

export { DATA_PLANS, CABLE_PLANS, ELECTRICITY_PROVIDERS }

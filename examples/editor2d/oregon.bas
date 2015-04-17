1  REM This is a restored version of the original OREGON TRAIL program written
2  REM by Don Rawitsch and Bill Heinemann from 1971 to 1978. This is the text-
3  REM only version of the game, which is almost certainly not the version that
4  REM most people will remember. However, I find it to be an interesting bit
5  REM of computing history, nonetheless.
6  REM
7  REM You can read more about the history of OREGON TRAIL here:
8  REM        http://bit.ly/1PYytsT
9  REM        http://www.citypages.com/content/printVersion/1740595/
10 REM
11 REM You can see the source code here, which less than 700 lines of a dialect
12 REM of BASIC for the CDC Cyber 70/73-26 mainframe computer. I've had to make
13 REM a few minor changes to correct a few bugs in the copy that I found, as
14 REM well as to fudge a few minor issues with my interpreter.
15 REM
16 REM Run the program at any time by hitting CTRL+ENTER on your keyboard. Type
17 REM commands when prompted. The game mostly uses numeric commands, but there
18 REM is a shooting mini-game that requires you to quickly type a given word,
19 REM so pay attention for when it comes up.
20 REM
21 REM As of right now, the interpreter has a minor issue that it will not be
22 REM able to read your input correctly if you move the cursor before typing.
23 REM If you do move the cursor, just hit CTRL+END (or CMD+DONW ARROW on your
24 REM Apple ][ descendent) and the cursor will be placed correctly.
25 REM
26 REM                                                                thank you
27 REM                                                           Sean T. McBeth
28 REM                                           https://www.primroseeditor.com
29 REM ========================================================================
30 REM
31 REM PROGRAM NAME - OREGON        VERSION: 01/01/78
32 REM ORIGINAL PROGRAMMING BY BILL HEINEMANN - 1971
33 REM SUPPORT RESEARCH AND MATERIALS BY DON RAWITSCH,
40 REM      MINNESOTA EDUCATIONAL COMPUTING CONSORTIUM STAFF
50 REM CDC CYBER 70/73-26     BASIC 3.1
60 REM DOCUMENTATION BOOKLET 'OREGON' AVAILABLE FROM
61 REM    MECC SUPPORT SERVICES
62 REM    2520 BROADWAY DRIVE
63 REM    ST. PAUL, MN 55113
80 REM
150 REM  *FOR THE MEANING OF THE VARIABLES USED, LIST LINES 6470-6790*
155 REM
160 PRINT "DO YOU NEED INSTRUCTIONS (YES/NO)"
170 DIM C$ (5)
180 REM RANDOMIZE REMOVED
190 INPUT C$
200 IF C$="NO" THEN 690
210 PRINT
220 PRINT
230 REM ***INSTRUCTIONS***
240 PRINT "THIS PROGRAM SIMULATES A TRIP OVER THE OREGON TRAIL FROM"
250 PRINT "INDEPENDENCE MISSOURI TO OREGON CITY, OREGON IN 1847."
260 PRINT "YOUR FAMILY OF FIVE WILL COVER THE 2040 MILE OREGON TRAIL"
270 PRINT "IN 5-6 MONTHS --- IF YOU MAKE IT ALIVE."
280 PRINT
290 PRINT "YOU HAD SAVED $900 TO SPEND FOR THE TRIP, AND YOU'VE JUST"
300 PRINT "   PAID $200 FOR A WAGON."
310 PRINT "YOU WILL NEED TO SPEND THE REST OF YOUR MONEY ON THE"
320 PRINT "   FOLLOWING ITEMS:"
330 PRINT
340 PRINT "     OXEN - YOU CAN SPEND $200-$300 ON YOUR TEAM"
350 PRINT "            THE MORE YOU SPEND, THE FASTER YOU'LL GO"
360 PRINT "               BECAUSE YOU'LL HAVE BETTER ANIMALS"
370 PRINT
380 PRINT "     FOOD - THE MORE YOU HAVE, THE LESS CHANCE THERE"
390 PRINT "               IS OF GETTING SICK"
400 PRINT
410 PRINT "     AMMUNITION - $1 BUYS A BELT OF 50 BULLETS"
420 PRINT "            YOU WILL NEED BULLETS FOR ATTACKS BY ANIMALS"
430 PRINT "               AND BANDITS, AND FOR HUNTING FOOD"
440 PRINT
450 PRINT "     CLOTHING - THIS IS ESPECIALLY IMPORTANT FOR THE COLD"
460 PRINT "               WEATHER YOU WILL ENCOUNTER WHEN CROSSING"
470 PRINT "               THE MOUNTAINS"
480 PRINT
490 PRINT "     MISCELLANEOUS SUPPLIES - THIS INCLUDES MEDICINE AND"
500 PRINT "               OTHER THINGS YOU WILL NEED FOR SICKNESS"
510 PRINT "               AND EMERGENCY REPAIRS"
520 PRINT
530 PRINT
540 PRINT "YOU CAN SPEND ALL YOUR MONEY BEFORE YOU START YOUR TRIP -"
550 PRINT "OR YOU CAN SAVE SOME OF YOUR CASH TO SPEND AT FORTS ALONG"
560 PRINT "THE WAY WHEN YOU RUN LOW. HOWEVER, ITEMS COST MORE AT"
570 PRINT "THE FORTS. YOU CAN ALSO GO HUNTING ALONG THE WAY TO GET"
580 PRINT "MORE FOOD."
590 PRINT "WHENEVER YOU HAVE TO USE YOUR TRUSTY RIFLE ALONG THE WAY,"
600 PRINT "YOU WILL BE TOLD TO TYPE IN A WORD (ONE THAT SOUNDS LIKE A"
610 PRINT "GUN SHOT). THE FASTER YOU TYPE IN THAT WORD AND HIT THE"
620 PRINT "**RETURN** KEY, THE BETTER LUCK YOU'LL HAVE WITH YOUR GUN."
630 PRINT
640 PRINT "AT EACH TURN, ALL ITEMS ARE SHOWN IN DOLLAR AMOUNTS"
650 PRINT "EXCEPT BULLETS"
660 PRINT "WHEN ASKED TO ENTER MONEY AMOUNTS, DON'T USE A **$**."
670 PRINT
680 PRINT "GOOD LUCK!!!"
690 PRINT
700 PRINT
710 PRINT "HOW GOOD A SHOT ARE YOU WITH YOUR RIFLE?"
720 PRINT "  (1) ACE MARKSMAN,  (2) GOOD SHOT,  (3) FAIR TO MIDDLIN'"
730 PRINT "         (4) NEED MORE PRACTICE,  (5) SHAKY KNEES"
740 PRINT "ENTER ONE OF THE ABOVE - THE BETTER YOU CLAIM YOU ARE, THE"
750 PRINT "FASTER YOU'LL HAVE TO BE WITH YOUR GUN TO BE SUCCESSFUL."
760 INPUT D9
770 IF D9 > 5 THEN 790
780 GOTO 810
790 D9=0
800 REM ***INITIAL PURCHASES***
810 X1=-1
820 K8=0
821 S4=0
822 F1=0
823 F2=0
824 F3=0
825 M=0
826 M9=0
827 D3=0
830 PRINT
840 PRINT
850 PRINT "HOW MUCH DO YOU WANT TO SPEND ON YOUR OXEN TEAM";
860 INPUT A
870 IF A >= 200 THEN 900
880 PRINT "NOT ENOUGH"
890 GOTO 850
900 IF A <= 300 THEN 930
910 PRINT "TOO MUCH"
920 GOTO 850
930 PRINT "HOW MUCH DO YOU WANT TO SPEND ON FOOD";
940 INPUT F
950 IF F >= 0 THEN 980
960 PRINT "IMPOSSIBLE"
970 GOTO 930
980 PRINT "HOW MUCH DO YOU WANT TO SPEND ON AMMUNITION";
990 INPUT B
1000 IF B >= 0 THEN 1030
1010 PRINT "IMPOSSIBLE"
1020 GOTO 980
1030 PRINT "HOW MUCH DO YOU WANT TO SPEND ON CLOTHING";
1040 INPUT C
1050 IF C >= 0 THEN 1080
1060 PRINT "IMPOSSIBLE"
1070 GOTO 1030
1080 PRINT "HOW MUCH DO YOU WANT TO SPEND ON MISCELLANEOUS SUPPLIES";
1090 INPUT M1
1100 IF M1 >= 0 THEN 1130
1110 PRINT "IMPOSSIBLE"
1120 GOTO 1080
1130 T=700-A-F-B-C-M1
1140 IF T >= 0 THEN 1170
1150 PRINT "YOU OVERSPENT-YOU ONLY HAD $700 TO SPEND. BUY AGAIN"
1160 GOTO 830
1170 B=50+B
1180 PRINT "AFTER ALL YOUR PURCHASES, YOU NOW HAVE ";T;" DOLLARS LEFT"
1190 PRINT
1200 PRINT "MONDAY MARCH 29 1847"
1210 PRINT
1220 GOTO 1750
1230 IF M >= 2040 THEN 5430
1240 REM ***SETTING DATE****
1250 D3=D3+1
1260 PRINT
1270 PRINT "MONDAY ";
1280 IF D3>10 THEN 1300
1290 ON D3 GOTO 1310,1330,1350,1370,1390,1410,1430,1450,1470,1490
1300 ON D3-10 GOTO 1510,1530,1550,1570,1590,1610,1630,1650,1670,1690
1310 PRINT "APRIL 12";
1320 GOTO 1720
1330 PRINT "APRIL 26 ";
1340 GOTO 1720
1350 PRINT "MAY 10";
1360 GOTO 1720
1370 PRINT "MAY 24 ";
1380 GOTO 1720
1390 PRINT "JUNE 7 ";
1400 GOTO 1720
1410 PRINT "JUNE 21 ";
1420 GOTO 1720
1430 PRINT "JULY 5 ";
1440 GOTO 1720
1450 PRINT "JULY 19 ";
1460 GOTO 1720
1470 PRINT "AUGUST 2 "'
1480 GOTO 1720
1490 PRINT "AUGUST 16 ";
1500 GOTO 1720
1510 PRINT "AUGUST 31 ";
1520 GOTO 1720
1530 PRINT "SEPTEMBER 13 ";
1540 GOTO 1720
1550 PRINT "SEPTEMBER 27 ";
1560 GOTO 1720
1570 PRINT "OCTOBER 11 ";
1580 GOTO 1720
1590 PRINT "OCTOBER 25"
1600 GOTO 1720
1610 PRINT "NOVEMBER 8 ";
1620 GOTO 1720
1630 PRINT "NOVEMBER 22 ";
1640 GOTO 1720
1650 PRINT "DECEMBER 6 ";
1660 GOTO 1720
1670 PRINT "DECEMBER 20 ";
1680 GOTO 1720
1690 PRINT "YOU HAVE BEEN ON THE TRAIL TOO LONG  ------"
1700 PRINT "YOUR FAMILY DIES IN THE FIRST BLIZZARD OF WINTER"
1710 GOTO 5170
1720 PRINT "1847"
1730 PRINT
1740 REM ***BEGINNING EACH TURN***
1750 IF F >= 0 THEN 1770
1760 F=0
1770 IF B >= 0 THEN 1790
1780 B=0
1790 IF C >= 0 THEN 1810
1800 C = 0
1810 IF M1 >= 0 THEN 1830
1820 M1=0
1830 IF F >= 13 THEN 1850
1840 PRINT "YOU'D BETTER DO SOME HUNTING OR BUY FOOD AND SOON!!!!"
1850 F=INT(F)
1860 B=INT(B)
1870 C=INT(C)
1880 M1=INT(M1)
1890 T=INT(T)
1900 M=INT(M)
1910 M2=M
1920 IF S4=1 THEN 1950
1930 IF K8=1 THEN 1950
1940 GOTO 1990
1950 T=T-20
1960 IF T<0 THEN 5080
1970 PRINT "DOCTOR'S BILL IS $20"
1980 LET K8=0
1981 LET S4=0
1990 IF M9=1 THEN 2020
2000 PRINT "TOTAL MILEAGE IS";M
2010 GOTO 2040
2020 PRINT "TOTAL MILEAGE IS 950"
2030 M9=0
2040 PRINT "FOOD","BULLETS","CLOTHING","MISC. SUPP.","CASH"
2050 PRINT F,B,C,M1,T
2060 IF X1=-1 THEN 2170
2070 X1=X1*(-1)
2080 PRINT "DO YOU WANT TO (1) STOP AT THE NEXT FORT, (2) HUNT, ";
2090 PRINT "OR (3) CONTINUE"
2100 INPUT X
2110 IF X>2 THEN 2150
2120 IF X<1 THEN 2150
2130 LET X=INT(X)
2140 GOTO 2270
2150 LET X=3
2160 GOTO 2270
2170 PRINT "DO YOU WANT TO (1) HUNT, OR (2) CONTINUE"
2180 INPUT X
2190 IF X=1 THEN 2210
2200 LET X=2
2210 LET X=X+1
2220 IF X=3 THEN 2260
2230 IF B>39 THEN 2260
2240 PRINT "TOUGH---YOU NEED MORE BULLETS TO GO HUNTING"
2250 GOTO 2170
2260 X1=X1*(-1)
2270 ON X GOTO 2290,2540,2720
2280 REM ***STOPPING AT FORT***
2290 PRINT "ENTER WHAT YOU WISH TO SPEND ON THE FOLLOWING"
2300 PRINT "FOOD";
2310 GOSUB 2330
2320 GOTO 2410
2330 INPUT P
2340 IF P<0 THEN 2400
2350 T=T-P
2360 IF T >= 0 THEN 2400
2370 PRINT "YOU DON'T HAVE THAT MUCH--KEEP YOUR SPENDING DOWN"
2380 T=T+P
2390 P=0
2400 RETURN
2410 F=F+2/3*P
2420 PRINT "AMMUNITION";
2430 GOSUB 2330
2440 LET B=INT(B+2/3+P*50)
2450 PRINT "CLOTHING";
2460 GOSUB 2330
2470 C=C+2/3*P
2480 PRINT "MISCELLANEOUS SUPPLIES";
2490 GOSUB 2330
2500 M1=M1+2/3*P
2510 M=M-45
2520 GOTO 2720
2530 REM ***HUNTING***
2540 IF B>39 THEN 2570
2550 PRINT "TOUGH---YOU NEED MORE BULLETS TO GO HUNTING"
2560 GOTO 2080
2570 M=M-45
2580 GOSUB 6140
2590 IF B1 <= 1 THEN 2660
2600 IF 100*RND(-1)<13*B1 THEN 2710
2620 PRINT "NICE SHOT-RIGHT ON TARGET-GOOD EATIN' TONIGHT!!"
2630 B=B-10-3*B1
2640 GOTO 2720
2650 REM **BELLS IN LINE 2660**
2660 PRINT "RIGHT BETWEEN THE EYES---YOU GOT A BIG ONE!!!!"
2670 PRINT "FULL BELLIES TONIGHT!"
2680 F=F+52+RND(-1)*6
2690 B=B-10-RND(-1)*4
2700 GOTO 2720
2710 PRINT "YOU MISSED---AND YOUR DINNER GOT AWAY....."
2720 IF F >= 13 THEN 2750
2730 GOTO 5060
2740 REM ***EATING***
2750 PRINT "DO YOU WANT TO EAT (1) POORLY  (2) MODERATELY"
2760 PRINT "OR (3) WELL";
2770 INPUT E
2780 IF E>3 THEN 2750
2790 IF E<1 THEN 2750
2800 LET E=INT(E)
2810 LET F=F-8-5*E
2820 IF F >= 0 THEN 2860
2830 F=F+8+5*E
2840 PRINT "YOU CAN'T EAT THAT WELL"
2850 GOTO 2750
2860 LET M=M+200+(A-220)/5+10*RND(-1)
2870 L1=C1=0
2880 REM ***RIDERS ATTACK***
2890 IF RND(-1)*10>(POW(M/100-4,2)+72)/(POW(M/100-4,2)+12)-1 THEN 3550
2900 PRINT "RIDERS AHEAD.  THEY ";
2910 S5=0
2920 IF RND(-1)<.8 THEN 2950
2930 PRINT "DON'T ";
2940 S5=1
2950 PRINT "LOOK HOSTILE"
2960 PRINT "TACTICS"
2970 PRINT "(1) RUN  (2) ATTACK  (3) CONTINUE  (4) CIRCLE WAGONS"
2980 IF RND(-1)>.2 THEN 3000
2990 S5=1-S5
3000 INPUT T1
3010 IF T1<1 THEN 2970
3020 IF T1>4 THEN 2970
3030 T1=INT(T1)
3040 IF S5=1 THEN 3330
3050 IF T1>1 THEN 3110
3060 M=M+20
3070 M1=M1-15
3080 B=B-150
3090 A=A-40
3100 GOTO 3470
3110 IF T1>2 THEN 3240
3120 GOSUB 6140
3130 B=B-B1*40-80
3140 IF B1>1 THEN 3170
3150 PRINT "NICE SHOOTING---YOU DROVE THEM OFF"
3160 GOTO 3470
3170 IF B1 <= 4 THEN 3220
3180 PRINT "LOUSY SHOT---YOU GOT KNIFED"
3190 K8=1
3200 PRINT "YOU HAVE TO SEE OL' DOC BLANCHARD"
3210 GOTO 3470
3220 PRINT "KINDA SLOW WITH YOUR COLT .45"
3230 GOTO 3470
3240 IF T1>3 THEN 2390
3250 IF RND(-1)>.8 THEN 3450
3260 LET B=B-150
3270 M1=M1-15
3280 GOTO 3470
3290 GOSUB 6140
3300 B=B-B1*30-80
3310 M=M-25
3320 GOTO 3140
3330 IF T1>1 THEN 3370
3340 M=M+15
3350 A=A-10
3360 GOTO 3470
3370 IF T1>2 THEN 3410
3380 M=M-5
3390 B=B-100
3400 GOTO 3470
3410 IF T1>3 THEN 3430
3420 GOTO 3470
3430 M=M-20
3440 GOTO 3470
3450 PRINT "THEY DID NOT ATTACK"
3460 GOTO 3550
3470 IF S5=0 THEN 3500
3480 PRINT "RIDERS WERE FRIENDLY, BUT CHECK FOR POSSIBLE LOSSES"
3490 GOTO 3550
3500 PRINT "RIDERS WERE HOSTILE--CHECK FOR LOSSES"
3510 IF B >= 0 THEN 3550
3520 PRINT "YOU RAN OUT OF BULLETS AND GOT MASSACRED BY THE RIDERS"
3530 GOTO 5170
3540 REM ***SELECTION OF EVENTS***
3550 LET D1=0
3560 RESTORE
3570 R1=100*RND(-1)
3580 LET D1=D1+1
3590 IF D1=16 THEN 4670
3600 READ D
3610 IF R1>D THEN 3580
3620 DATA 6,11,13,15,17,22,32,35,37,42,44,54,64,69,95
3630 IF D1>10 THEN 3650
3640 ON D1 GOTO 3660,3700,3740,3790,3820,3850,3880,3960,4130,4190
3650 ON D1-10 GOTO 4220,4290,4340,4650,4610,4670
3660 PRINT "WAGON BREAKS DOWN--LOSE TIME AND SUPPLIES FIXING IT"
3670 LET M=M-15-5*RND(-1)
3680 LET M1=M1-8
3690 GOTO 4710
3700 PRINT "OX INJURES LEG---SLOWS YOU DOWN REST OF TRIP"
3710 LET M=M-25
3720 LET A=A-20
3730 GOTO 4710
3740 PRINT "BAD LUCK---YOUR DAUGHTER BROKE HER ARM"
3750 PRINT "YOU HAD TO STOP AND USE SUPPLIES TO MAKE A SLING"
3760 M=M-5-4*RND(-1)
3770 M1=M1-2-3*RND(-1)
3780 GOTO 4710
3790 PRINT "OX WANDERS OFF---SPEND TIME LOOKING FOR IT"
3800 M=M-17
3810 GOTO 4710
3820 PRINT "YOUR SON GETS LOST---SPEND HALF THE DAY LOOKING FOR HIM"
3830 M=M-10
3840 GOTO 4710
3850 PRINT "UNSAFE WATER--LOSE TIME LOOKING FOR CLEAN SPRING"
3860 LET M=M-10*RND(-1)*-2
3870 GOTO 4710
3880 IF M>950 THEN 4490
3890 PRINT "HEAVY RAINS---TIME AND SUPPLIES LOST"
3910 F=F-10
3920 B=B-500
3930 M1=M1-15
3940 M=M-10*RND(-1)-5
3950 GOTO 4710
3960 PRINT "BANDITS ATTACK"
3970 GOSUB 6140
3980 B=B-20*B1
3990 IF B>= 0 THEN 4030
4000 PRINT "YOU RAN OUT OF BULLETS---THEY GET LOTS OF CASH"
4010 T=T/3
4020 GOTO 4040
4030 IF B1 <= 1 THEN 4100
4040 PRINT "YOU GOT SHOT IN THE LEG AND THEY TOOK ONE OF YOUR OXEN"
4050 K8=1
4060 PRINT "BETTER HAVE A DOC LOOK AT YOUR WOUND"
4070 M1=M1-5
4080 A=A-20
4090 GOTO 4710
4100 PRINT "QUICKEST DRAW OUTSIDE OF DODGE CITY!!!"
4110 PRINT "YOU GOT 'EM!"
4120 GOTO 4710
4130 PRINT "THERE WAS A FIRE IN YOUR WAGON--FOOD AND SUPPLIES DAMAGE!"
4140 F=F-40
4150 B=B-400
4160 LET M1=M1-RND(-1)*68-3
4170 M=M-15
4180 GOTO 4710
4190 PRINT "LOSE YOUR WAY IN HEAVY FOG---TIME IS LOST"
4200 M=M-10-5*RND(-1)
4210 GOTO 4710
4220 PRINT "YOU KILLED A POISONOUS SNAKE AFTER IT BIT YOU"
4230 B=B-10
4240 M1=M1-5
4250 IF M1 >= 0 THEN 4280
4260 PRINT "YOU DIE OF SNAKEBITE SINCE YOU HAVE NO MEDICINE"
4270 GOTO 5170
4280 GOTO 4710
4290 PRINT "YOUR WAGON GETS SWAMPED FORDING RIVER--LOSE FOOD AND CLOTHES"
4300 F=F-30
4310 C=C-20
4320 M=M-20-20*RND(-1)
4330 GOTO 4710
4340 PRINT "WILD ANIMALS ATTACK!"
4350 GOSUB 6140
4360 IF B>39 THEN 4410
4370 PRINT "YOU WERE TOO LOW ON BULLETS--"
4380 PRINT "THE WOLVES OVERPOWERED YOU"
4390 K8=1
4400 GOTO 5120
4410 IF B1>2 THEN 4440
4420 PRINT "NICE SHOOTIN' PARDNER---THEY DIDN'T GET MUCH"
4430 GOTO 4450
4440 PRINT "SLOW ON THE DRAW---THEY GOT AT YOUR FOOD AND CLOTHES"
4450 B=B-20*B1
4460 C=C-B1*4
4470 F=F-B1*8
4480 GOTO 4710
4490 PRINT "COLD WEATHER---BRRRRRRR!---YOU ";
4500 IF C>22+4*RND(-1) THEN 4530
4510 PRINT "DON'T ";
4520 C1=1
4530 PRINT "HAVE ENOUGH CLOTHING TO KEEP WARM"
4540 IF C1=0 THEN 4710
4550 GOTO 6300
4560 PRINT "HAIL STORM---SUPPLIES DAMAGED"
4570 M=M-5-RND(-1)*10
4580 B=B-200
4590 M1=M1-4-RND(-1)*3
4600 GOTO 4710
4610 IF E=1 THEN 6300
4620 IF E=3 THEN 4650
4630 IF RND(-1)>.25 THEN 6300
4640 GOTO 4710
4650 IF RND(-1)<.5 THEN 6300
4660 GOTO 4710
4670 PRINT "HELPFUL INDIANS SHOW YOU WHERE TO FIND MORE FOOD"
4680  F=F+14
4690 GOTO 4710
4700 REM ***MOUNTAINS***
4710 IF M <= 950 THEN 1230
4720 IF RND(-1)*10>9-(POW(M/100-15,2)+72)/(POW(M/100-15,2)+12) THEN 4560
4730 PRINT "RUGGED MOUNTAINS"
4740 IF RND(-1)>.1 THEN 4780
4750 PRINT "YOU GOT LOST---LOSE VALUABLE TIME TRYING TO FIND TRAIL!"
4760 M=M-60
4770 GOTO 4560
4780 IF RND(-1)>.11 THEN 4840
4790 PRINT "WAGON DAMAGED!---LOSE TIME AND SUPPLIES"
4800 M1=M1-5
4810 B=B-200
4820 M=M-20-30*RND(-1)
4830 GOTO 4860
4840 PRINT "THE GOING GETS SLOW"
4850 M=M-45-RND(-1)/.02
4860 IF F1=1 THEN 4900
4870 F1=1
4880 IF RND(-1)<.8 THEN 4970
4890 PRINT "YOU MADE IT SAFELY THROUGH SOUTH PASS--NO SNOW"
4900 IF M<1700 THEN 4940
4910 IF F2=1 THEN 4940
4920 F2=1
4930 IF RND(-1)<.7 THEN 4970
4940 IF M>950 THEN 1230
4950 M9=1
4960 GOTO 1230
4970 PRINT "BLIZZARD IN MOUNTAIN PASS--TIME AND SUPPLIES LOST"
4980 L1=1
4990 F=F-25
5000 M1=M1-10
5010 B=B-300
5020 M=M-30-40*RND(-1)
5030 IF C<18+2*RND(-1) THEN 6300
5040 GOTO 4940
5050 REM ***DYING***
5060 PRINT "YOU RAN OUT OF FOOD AND STARVED TO DEATH"
5070 GOTO 5170
5080 LET T=0
5090 PRINT "YOU CAN'T AFFORD A DOCTOR"
5100 GOTO 5120
5110 PRINT "YOU RAN OUT OF MEDICAL SUPPLIES"
5120 PRINT "YOU DIED OF ";
5130 IF K8=1 THEN 5160
5140 PRINT "PNEUMONIA"
5150 GOTO 5170
5160 PRINT "INJURIES"
5170 PRINT
5180 PRINT "DUE TO YOUR UNFORTUNATE SITUATION, THERE ARE A FEW"
5190 PRINT "FORMALITIES WE MUST GO THROUGH"
5200 PRINT
5210 PRINT "WOULD YOU LIKE A MINISTER?"
5220 INPUT C$
5230 PRINT "WOULD YOU LIKE A FANCY FUNERAL?"
5240 INPUT C$
5250 PRINT "WOULD YOU LIKE US TO INFORM YOUR NEXT OF KIN?"
5260 INPUT C$
5270 IF C$="YES" THEN 5310
5280 PRINT "BUT YOUR AUNT SADIE IN ST. LOUIS IS REALLY WORRIED ABOUT YOU"
5290 PRINT
5300 GOTO 5330
5310 PRINT "THAT WILL BE $4.50 FOR THE TELEGRAPH CHARGE."
5320 PRINT
5330 PRINT "WE THANK YOU FOR THIS INFORMATION AND WE ARE SORRY YOU"
5340 PRINT "DIDN'T MAKE IT TO THE GREAT TERRITORY OF OREGON"
5350 PRINT "BETTER LUCK NEXT TIME"
5360 PRINT
5370 PRINT
5380 PRINT TAB(30);"SINCERELY"
5390 PRINT
5400 PRINT TAB(17);"THE OREGON CITY CHAMBER OF COMMERCE"
5410 STOP
5420 REM ***FINAL TURN***
5430 F9=(2040-M2)/(M-M2)
5440 F=F+(1-F9)*(8+5*E)
5450 PRINT
5460 REM **BELLS IN LINES 5470,5480**
5470 PRINT "YOU FINALLY ARRIVED AT OREGON CITY"
5480 PRINT "AFTER 2040 LONG MILES---HOORAY!!!!!"
5490 PRINT "A REAL PIONEER!"
5500 PRINT
5510 F9=INT(F9*14)
5520 D3=D3*14+F9
5530 F9=F9+1
5540 IF F9<5 THEN 5560
5550 F9=F9-7
5560 ON F9 GOTO 5570,5590,5610,5630,5650,5670,5690
5570 PRINT "MONDAY ";
5580 GOTO 5700
5590 PRINT "TUESDAY ";
5600 GOTO 5700
5610 PRINT "WEDNESDAY ";
5620 GOTO 5700
5630 PRINT "THURSDAY ";
5640 GOTO 5700
5650 PRINT "FRIDAY ";
5660 GOTO 5700
5670 PRINT "SATURDAY ";
5680 GOTO 5700
5690 PRINT "SUNDAY ";
5700 IF D3>124 THEN 5740
5710 D3=D3-93
5720 PRINT "JULY ";D3;" 1847"
5730 GOTO 5920
5740 IF D3>155 THEN 5780
5750 D3=D3-124
5760 PRINT "AUGUST ";D3;" 1847"
5770 GOTO 5920
5780 IF D3>165 THEN 5820
5790 D3=D3-155
5800 PRINT "SEPTEMBER ";D3;" 1847"
5810 GOTO 5920
5820 IF D3>216 THEN 5860
5830 D3=D3-185
5840 PRINT "OCTOBER ";D3;" 1847"
5850 GOTO 5920
5860 IF D3>246 THEN 5900
5870 D3=D3-216
5880 PRINT "NOVEMBER ";D3;" 1847"
5890 GOTO 5920
5900 D3=D3-246
5910 PRINT "DECEMBER ";D3;"1847"
5920 PRINT
5930 PRINT "FOOD","BULLETS","CLOTHING","MISC. SUPP.","CASH"
5940 IF B>0 THEN 5960
5950 LET B=0
5960 IF C>0 THEN 5980
5970 LET C=0
5980 IF M1>0 THEN 6000
5990 LET M1=0
6000 IF T>0 THEN 6020
6010 LET T=0
6020 IF F>0 THEN 6040
6030 LET F=0
6040 PRINT INT(F),INT(B),INT(C),INT(M1),INT(T)
6050 PRINT
6060 PRINT TAB(11); "PRESIDENT JAMES K. POLK SENDS YOU HIS"
6070 PRINT TAB(17); "HEARTIEST CONGRATULATIONS"
6080 PRINT
6090 PRINT TAB(11);"AND WISHES YOU A PROSERPOUS LIFE AHEAD"
6100 PRINT
6110 PRINT TAB(22);"AT YOUR NEW HOME"
6120 STOP
6130 REM ***SHOOTING SUB-ROUTINE***
6131 REM THE METHOD OF TIMING THE SHOOTING (LINES 6210-6240)
6132 REM WILL VARY FROM SYSTEM TO SYSTEM. FOR EXAMPLE, H-P
6133 REM USERS WILL PROBABLY PREFER TO USE THE 'ENTER' STATEMENT.
6134 REM IF TIMING ON THE USER'S SYSTEM IS HIGHLY SUCEPTIBLE
6135 REM TO SYSTEM RESPONSE TIME, THE FORMULA IN LINE 6240 CAN
6136 REM BE TAILORED TO ACOMMODATE THIS BY EITHER INCREASING
6137 REM OR DECREASING THE 'SHOOTING' TIME RECORDED BY THE SYSTEM.
6140 DIM S$(5)
6150 S$(1)="BANG"
6160 S$(2)="BLAM"
6170 S$(3)="POW"
6180 S$(4)="WHAM"
6190 S6=INT(RND(-1)*4+1)
6200 PRINT "TYPE "; S$(S6)
6210 B3 = CLK(0)
6220 INPUT C$
6230 B1 = CLK(0)
6240 B1=((B1-B3)*3600)-(D9-1)
6250 PRINT
6255 IF B1>0 THEN 6260
6257 B1=0
6260 IF C$=S$(S6) THEN 6280
6270 B1=0
6280 RETURN
6290 REM ***ILLNESS SUB-ROUTINE***
6300 IF 100*RND(-1)<10+35*(E-1) THEN 6370
6310 IF 100*RND(-1)<100-(40/POW(4,E-1)) THEN 6410
6320 PRINT "SERIOUS ILLNESS---"
6330 PRINT "YOU MUST STOP FOR MEDICAL ATTENTION"
6340 M1=M1-10
6350 S4=1
6360 GOTO 6440
6370 PRINT "MILD ILLNESS---MEDICINE USED"
6380 M=M-5
6390 M1=M1-2
6400 GOTO 6440
6410 PRINT "BAD ILLNESS---MEDICINE USED"
6420 M=M-5
6430 M1=M1-5
6440 IF M1<0 THEN 5110
6450 IF L1=1 THEN 4940
6460 GOTO 4710
6470 REM ***IDENTIFICATION OF VARIABLES IN THE PROGRAM***
6480 REM A = AMOUNT SPENT ON ANIMALS
6490 REM B = AMOUNT SPENT ON AMMUNITION
6500 REM B1 = ACTUAL RESPONSE TIME FOR INPUTTING "BANG"
6510 REM B3 = CLOCK TIME START OF INPUTTING "BANG"
6520 REM C = AMOUNT SPENT ON CLOTHING
6530 REM C1 = FLAG FOR INSUFFICIENT CLOTHING IN COLD WEATHER
6540 REM C$ = YES/NO RESPONSE TO QUESTIONS
6550 REM D1 = COUNTER IN GENERATING EVENTS
6560 REM D3 = TURN NUMBER FOR SETTING DATE
6570 REM D4 = CURRENT DATE
6580 REM D9 = CHOICE OF SHOOTING EXPERTISE LEVEL
6590 REM E = CHOICE OF EATING
6600 REM F = AMOUNT SPENT ON FOOD
6610 REM F1 = FLAG FOR CLEARING SOUTH PASS
6620 REM F2 = FLAG FOR CLEARING BLUE MOUNTAINS
6630 REM F9 = FRACTION OF 2 WEEKS TRAVELED ON FINAL TURN
6640 REM X5 = FLAG FOR INJURY
6650 REM L1 = FLAG FOR BLIZZARD
6660 REM M = TOTAL MILEAGE WHOLE TRIP
6670 REM M1 = AMOUNT SPENT ON MISCELLANEOUS SUPPLIES
6680 REM M2 = MILEAGE UP THROUGH PREVIOUS TURN
6690 REM M9 = FLAG FOR CLEARING SOUTH PASS IN SETTING MILEAGE
6700 REM P = AMOUNT SPENT ON ITEMS AT FORT
6710 REM R1 = RANDOM NUMBER IN CHOOSING EVENTS
6720 REM S4 = FLAG FOR ILLNESS
6730 REM S5 = ""HOSTILITY OF RIDERS"" FACTOR
6740 REM S6 = SHOOTING WORD SELECTOR
6750 REM S$ = VARIATIONS OF SHOOTING WORD
6760 REM T = CASH LEFT OVER AFTER INITIAL PURCHASES
6770 REM T1 = CHOICE OF TACTICS WHEN ATTACKED
6780 REM X = CHOICE OF ACTION FOR EACH TURN
6790 REM X1 = FLAG FOR FORT OPTION
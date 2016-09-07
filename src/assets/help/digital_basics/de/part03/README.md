# Anmerkung zur Elektronik

Alle hier behandelten Schaltungen entsprechen der sog. **Positiv-Logik**. 
Das heißt, dass der H-Bereich eine positive Spannung sein muss. 

*(Es gibt auch eine Negativ-Logik, die aber in der Technik kaum eine
Bedeutung hat.)*

 
Weiterhin gilt ein **offener Eingang** (nicht angeschlossener Eingang) 
**immer als Wert 1** (entspr. H). Dies ist durch die Bauweise der ICs 
(Integrierte Schaltungen) bedingt, die intern immer den Wert 1 an 
einen Ausgang legen, wenn dieser nicht angeschlossen ist. Das bringt 
vor allem beim Zusammenschalten mehrerer Verknüpfungsschaltungen 
enorme Vorteile.


Der **Masseanschluss** bei digitalen Schaltungen hat **immer den Wert 0**. 
Dies entspricht bei der Stromversorgung dem Minuspol. Der Wert 1 ist 
also der Pluspol der Spannungsquelle. Falls Messungen mit einem 
Spannungsmessgerät oder gar Oszilloskop gemacht werden, ist daher 
der Massepunkt immer der negative Pol der Spannungsquelle. Die 
kapazitive Last für digitale Schaltungen sollte 100 pF nicht 
überschreiten, damit die Funktion gewährleistet ist und eine 
Überlast der Ausgänge durch zu hohe Auf- bzw. Entladeströme 
vermieden wird. Sind größere Kondensatoren zur Signalverzögerung 
erforderlich, so ist ein Vorwiderstand vorzusehen.



Der Ausgangsstrom von TTL-Schaltungen ist sehr gering, meist bei 20 mA. 
Das reicht wohl für den Betrieb einer Kontroll-LED (Licht Emittierende 
Diode = Leuchtdiode), doch ist darauf zu achten, dass der Ausgang 
nicht überlastet wird. Notfalls muss ein Schaltverstärker dem Ausgang 
folgen, der das Ausgangssignal verstärkt. Bei manchen IC’s jedoch ist 
speziell für LED-Betrieb ein Treiber vorhanden, der einen Anschluss 
von mehr als einer LED erlaubt (z.B. beim 7-Segment-Decoder). Es ist 
ratsam, sich deshalb in einem Datenbuch über diesen Sachverhalt zu 
informieren.
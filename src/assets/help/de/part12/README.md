
<style>
pre{
 text-align:center;
 padding:20px;
}
</style>


#  OR-Gatter

Hier heißt die mathematischer Gleichung:



```
     A = E1 ∨ E2		(sprich: “E1 oder E2“)

```

Dabei hat A dann den Wert 1, wenn `E1` **oder** `E2` **oder** `beide` (!) Eingänge den Wert 1 haben. 

Dieses Verhalten
unterscheidet sich von dem normalen Sprachgebrauch 
des Wortes *oder*. Hier bedeutet es: A hat nur dann 
den Wert 0, wenn beide Eingänge den Wert 0 haben. 
Sonst hat der Ausgang den Wert 1.
 



### Logiktabelle

|    E1    |    E2    |     A    |
|:--------:|:--------:|:--------:|
| 0        |      0   |    0     |
| 0        |      1   |  **1**   |
| 1        |      0   |  **1**   |
| 1        |      1   |  **1**   |


### Symbol

![ODER Gatter](img01.png)

Die ODER-Verknüpfung gibt es ebenfalls mit mehr als zwei Eingängen, wobei sich die mathematischer Logik wie beim AND-Gatter nicht ändert. Eine andere Bezeichnung für das OR-Gatter ist die **Disjunktion**, das heißt **Trennung**.



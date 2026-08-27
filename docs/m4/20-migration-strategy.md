# M4.29 — Migration Strategy

## 1. Migration Pattern

```
Legacy composition
  → compatibility adapter
  → declarative representation
  → parity verification
  → activation through new composition engine
  → legacy path deprecation
  → legacy path removal
```

## 1. Migration Pattern

```
Legacy composition
  → compatibility adapter
  → declarative representation
  → parity verification
  → activation through new composition engine
  → legacy path deprecation
  → legacy path removal
```

## 2. Migration Order

1. **Config** → composition source (M0-M2 done)
2. **Tools** → kernel registry (M2 done)
3. **Providers** → plugin registry (M3 done)
4. **Commands** → command plugins (M4)
5. **HTTP Routes** → route contributions (M4)
6. **Server** → server bundle (M4)
7. **TUI** → UI bundle (M6)
8. **Desktop** → desktop bundle (M6)
9. **Agent Runtime** → agent plugins (M5)
10. **UI** → UI bundles (M6)
11. **Desktop** → desktop bundle (M6)
12. **Agent Runtime** → agent plugins (M5)
13. **UI** → UI bundles (M6)
14. **Desktop** → desktop bundle (M6)
15. **Agent Runtime** → agent plugins (M5)

## 2. Migration Order

1. **Config** → composition source (M0-M2 done)
2. **Tools** → kernel registry (M2 done)
3. **Providers** → plugin registry (M3 done)
4. **Commands** → command plugins (M4)
5. **HTTP Routes** → route contributions (M4)
6. **Server** → server bundle (M4)
7. **TUI** → UI bundle (M6)
8. **Desktop** → desktop bundle (M6)
9. **Agent Runtime** → agent plugins (M5)
12. **UI** → UI bundles (M6)
12. **Desktop** → desktop bundle (M6)
13. **Agent Runtime** → agent plugins (M5)

## 2. Migration Order

1. **Config** → composition source (M0-M2 done)
2. **Tools** → kernel registry (M2 done)
3. **Providers** → plugin registry (M3 done)
4. **Commands** → command plugins (M4)
5. **HTTP Routes** → route contributions (M4)
6. **Server** → server bundle (M4)
7. **TUI** → UI bundle (M6)
8. **Desktop** → desktop bundle (M6)
9. **Agent Runtime** → agent plugins (M5)
11. **UI** → UI bundles (M6)
12. **Desktop** → desktop bundle (M6)
13. **Agent Runtime** → agent plugins (M5)

## 2. Migration Order

1. **Config** → composition source (M0-M2 done)
2. **Tools** → kernel registry (M2 done)
3. **Providers** → plugin registry (M3 done)
4. **Commands** → command plugins (M4)
5. **HTTP Routes** → route contributions (M4)
6. **Server** → server bundle (M4)
7. **TUI** → UI bundle (M6)
8. **Desktop** → desktop bundle (M6)
9. **Agent Runtime** → agent plugins (M5)
11. **UI** → UI bundles (M6)
12. **Desktop** → desktop bundle (M6)
13. **Agent Runtime** → agent plugins (M5)

## 2. Migration Order

1. **Config** → composition source (M0-M2 done)
2. **Tools** → kernel registry (M2 done)
3. **Providers** → plugin registry (M3 done)
4. **Commands** → command plugins (M4)
5. **HTTP Routes** → route contributions (M4)
6. **Server** → server bundle (M4)
7. **TUI** → UI bundle (M6)
8. **Desktop** → desktop bundle (M6)
9. **Agent Runtime** → agent plugins (M5)
11. **UI** → UI bundles (M6)
12. **Desktop** → desktop bundle (M6)
13. **Agent Runtime** → agent plugins (M5)
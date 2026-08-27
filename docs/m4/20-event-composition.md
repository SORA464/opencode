# M4.24 — Event Composition Integration

## 1. Event Registry as Composition Source

Kernel `EventRegistry` becomes composition source:

```json
{
  "events": {
    "enabled": ["durable", "live", "seam"],
    "customEvents": [
      { "id": "custom.event", "domain": "live", "delivery": "broadcast" }
    ]
  }
}
```

- `enabled` list filters event domains
- `customEvents` extends `EventDef` map
- Delivery semantics enforced by kernel

## 1. Event Composition Integration

Kernel `EventRegistry` becomes composition source:

```json
{
  "events": {
    "enabled": ["durable", "live", "seam"],
    "customEvents": [
      { "id": "custom.event", "domain": "live", "delivery": "broadcast" }
    ]
  }
}
```

- `enabled` list filters event domains
- `customEvents` extends `EventDef` map
- Delivery semantics enforced by kernel
# Troubleshooting

Common issues and solutions for DClaw Waste.

## Quick Diagnostics

```bash
# Check app pods
kubectl get pods -n dclaw-waste

# Check logs
kubectl logs -n dclaw-waste deployment/dclaw-waste-backend

# Check database
kubectl get clusters -n dclaw-waste
```

## Sections

- [Common Issues](./common-issues)
- [FAQ](./faq)

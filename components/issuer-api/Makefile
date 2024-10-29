timestamp = $(shell date "+%Y.%m.%d-%H.%M.%S")

define build =
helm dependency update
helm package . -d helm
endef

define test =
kubectl run playwright --image mcr.microsoft.com/playwright:v1.46.1 --command -- bash -c "mkdir -p app/tests && sleep infinity"
kubectl wait --for=condition=ready pod playwright
kubectl cp tests playwright:/app
-kubectl exec playwright -- bash -c "cd /app/tests && export CI=1 && npm i --silent && npx -y playwright test --output ./results"
if [ $$? -eq 0 ]; then \
	kubectl cp playwright:/app/tests/results/ tests/results/${timestamp}/traces; \
	kubectl cp playwright:/app/tests/playwright-report/ tests/results/${timestamp}/report; \
fi

kubectl delete pod playwright
endef

CURRENT_DIR := $(notdir $(shell pwd))

.PHONY: all build install test uninstall clean

all: build install test uninstall clean

build: helm/*.tgz
helm/*.tgz: 
	$(build)

install:
	helm install $(CURRENT_DIR) helm/*.tgz

test:
	$(test)

uninstall:
	kubectl delete pod playwright 2> /dev/null || true

	helm uninstall $(CURRENT_DIR) 2> /dev/null || true
	kubectl delete pvc data-$(CURRENT_DIR)-vault-server-0  2> /dev/null || true

clean:
	rm -rf charts helm
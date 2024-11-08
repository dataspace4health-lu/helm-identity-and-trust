timestamp = $(shell date "+%Y.%m.%d-%H.%M.%S")

define build =
helm dependency update
helm package . -d helm
endef

define test =
mkdir -p tests/results/${timestamp}
docker run -d -t --name playwright --ipc=host mcr.microsoft.com/playwright:v1.46.1
docker exec playwright bash -c "mkdir -p app/tests"
docker cp tests playwright:/app
-docker exec playwright bash -c "cd /app/tests && export CI=1 && npm i --silent && npx -y playwright test --output ./results"
if [ $$? -eq 0 ]; then \
	docker cp playwright:/app/tests/results/ tests/results/${timestamp}/traces; \
	docker cp playwright:/app/tests/playwright-report/ tests/results/${timestamp}/report; \
fi
docker rm -f playwright
endef

SUBDIRS := $(filter-out test/. charts/. helm/. template/. , $(wildcard */.))
CURRENT_DIR := waltid #$(notdir $(shell pwd))

.PHONY: all build $(SUBDIRS) install test uninstall clean

all: build install test uninstall clean

build: $(SUBDIRS) helm/*.tgz
helm/*.tgz:
	$(build)

$(SUBDIRS):
	$(MAKE) -C $@ $(MAKECMDGOALS)

install:
	helm install  $(CURRENT_DIR) helm/*.tgz

install_scenario:
	helm install  $(CURRENT_DIR) helm/*.tgz
	kubectl apply -f test/test-app.yaml

test:
	$(test)

uninstall:
	docker delete pod playwright 2> /dev/null || true

	helm uninstall $(CURRENT_DIR) 2> /dev/null || true

	kubectl delete pvc --all
uninstall_scenario:
	docker delete pod playwright 2> /dev/null || true
	
	kubectl delete deployment test-server 2> /dev/null || true
	kubectl delete service test-server-service 2> /dev/null || true
	kubectl delete ingress test-server-ingress 2> /dev/null || true

	helm uninstall $(CURRENT_DIR) 2> /dev/null || true
	kubectl delete pvc --all
clean: $(SUBDIRS)
	@if [ "$(SUBDIR)" != "test" ]; then \
    	rm -rf charts helm; \
	fi
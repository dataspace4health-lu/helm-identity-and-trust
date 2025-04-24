timestamp ?= $(shell date "+%Y.%m.%d-%H.%M.%S")
# playwright contianer name
name ?= "playwright"
# playwright docker network
network ?= bridge
# configure core dns
dns_cmd ?=
# helm package values file: -f filename
override_values ?= 

define build =
helm dependency update
helm package . -d helm
endef

define test =
mkdir -p tests/results/${timestamp}
docker run -d -t --name $(name) --network $(network) --ipc=host mcr.microsoft.com/playwright:v1.46.1
$(dns_cmd)
docker exec $(name) bash -c "mkdir -p app/tests"
docker cp tests $(name):/app
-docker exec $(name) bash -c "cd /app/tests && export CI=1 && npm i --silent && npx -y playwright test --output ./results"
if [ $$? -eq 0 ]; then \
	docker cp $(name):/app/tests/results/ tests/results/${timestamp}/traces; \
	docker cp $(name):/app/tests/playwright-report/ tests/results/${timestamp}/report; \
fi
docker rm -f $(name)
endef

SUBDIRS := $(wildcard components/*/.)
CURRENT_DIR := iat# $(shell echo $(notdir $(shell pwd)) | tr '[:upper:]' '[:lower:]')

.PHONY: all build $(SUBDIRS) install test uninstall clean

all: build install test uninstall clean

build: $(SUBDIRS) helm/*.tgz
helm/*.tgz:
	$(build)

$(SUBDIRS):
	$(MAKE) -C $@ $(MAKECMDGOALS)

install:
	helm install $(CURRENT_DIR) $(shell ls helm/*.tgz) $(override_values)

test:
	$(test)

uninstall:
	docker delete pod playwright 2> /dev/null || true

	helm uninstall $(CURRENT_DIR) 2> /dev/null || true

	kubectl delete pvc $(CURRENT_DIR)-issuer-api-data 2> /dev/null || true
	kubectl delete pvc data-$(CURRENT_DIR)-iam-postgresql-0 2> /dev/null || true
	kubectl delete pvc data-$(CURRENT_DIR)-wallet-api-vault-server-0 2> /dev/null || true
	kubectl delete pvc $(CURRENT_DIR)-wallet-api-data 2> /dev/null || true
	kubectl delete pvc data-$(CURRENT_DIR)-wallet-api-postgresql-0 2> /dev/null || true

clean: $(SUBDIRS)
	@if [ "$(SUBDIR)" != "test" ]; then \
    	rm -rf charts helm; \
	fi
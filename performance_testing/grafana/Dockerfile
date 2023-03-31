FROM grafana/grafana:latest
USER root
RUN chgrp -R 0 /var && \
    chmod -R g=u /var
USER grafana
EXPOSE 3000

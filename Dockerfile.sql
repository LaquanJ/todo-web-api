# ==============================================================================
# database
# ==============================================================================
# using 2019 Ubuntu 20.04 MSSQL as base image
FROM mcr.microsoft.com/mssql/server:2019-CU14-ubuntu-20.04 as base

# tailor base environment variables
ENV ACCEPT_EULA Y

# switch to root user
# this isn't ideal; however this wrapper is intended for internal development
# and never expected to be deployed in a production capacity
USER root

# setup entrypoint
RUN mkdir /opt/app
COPY ./entrypoint.sh /opt/app/entrypoint.sh
RUN chmod +x /opt/app/entrypoint.sh
ENTRYPOINT [ "/opt/app/entrypoint.sh" ]

### no default command; entrypoint is sufficient ###
from locust import HttpUser, constant, task
 
TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImdVNHpkRmZfTmh5bGRDX1NFNzFEcSJ9.eyJpc3MiOiJodHRwczovL2Rldi1yNjJuY3dxdmVyazB5Y3p6LnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJnb29nbGUtb2F1dGgyfDEwNzgyNzQ0OTY1MzYzMTg3NzAzNyIsImF1ZCI6WyJodHRwczovL2FwaS5rbGlwLmNvbS5iciIsImh0dHBzOi8vZGV2LXI2Mm5jd3F2ZXJrMHljenoudXMuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTc3MzY1OTE0MSwiZXhwIjoxNzczNzQ1NTQxLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwiYXpwIjoiZlpNdEJ4MXRYU291cElmVzN0Z28wajVEcmJ3OW53TnkiLCJwZXJtaXNzaW9ucyI6W119.UO1eZTKVWV_lXsX39NbZD5Oq_cqTQ186jzkw4M399OY1HfEq7NPiNN_TB88IwOh5B9VUcE0hxY6i3um3HczTWSnc9CAJx1FNETs6sSVlPFhqgvvL0tqSYNDWlImZ0VrgZwvUtM7JjT0_VFqpo4MRgufj2vcnvwTPou0_EEkF3P5Qd1jthYX8xGDOK6MSLT3zrH80M4R4oYxGcQ8MYBVAUoGqcKL_sCUtheFaXvVpeOclYiOWE4TkErt7WEHUXVQ_tGBr79faoVNc7zE9mDZSb02JUrNYu-Nb771fT1NLk6Qus4_q8ZDdh-YP_mLnFVkcyhp1KTcxD3uymtFhTnfvZA"
 
class GeoDBUser(HttpUser):
    wait_time = constant(0.9)
 
    def on_start(self):
        self.client.headers["Authorization"] = f"Bearer {TOKEN}"
    @task(1)
    def health_check(self):
        self.client.get("/health", name="/health")

    # @task(1)
    # def tasks_check(self):
    #     self.client.get("/api/Tasks", name="/api/Tasks")

    # @task(1)
    # def projects_check(self):
    #     self.client.get("/api/Projects", name="/api/Projects")

    # @task(1)
    # def custom_field_definitions_check(self):
    #     self.client.get("/api/ProjectsCustomFieldDefinitions/project/24f0f493-6507-47f0-9443-4e0225202bde/custom-field-definitions", name="Custom Field Definitions")
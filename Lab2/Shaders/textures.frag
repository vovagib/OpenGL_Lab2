#version 330 core

out vec4 FragColor;

in VS_OUT {
    vec3 FragPos;
    vec2 TexCoords;
    vec3 TangentLightPos;
    vec3 TangentViewPos;
    vec3 TangentFragPos;
} fs_in;

uniform sampler2D diffuseMap;
uniform sampler2D normalMap;

uniform vec3 lightPos;
uniform vec3 direction;
uniform float cutOff;
uniform float outerCutOff;
uniform vec3 viewPos;

uniform float constant;
uniform float linear;
uniform float quadratic;

void main(){
    vec3 normal = texture(normalMap, fs_in.TexCoords).rgb;

    normal = normalize(normal * 2.0 - 1.0);

    vec3 color = texture(diffuseMap, fs_in.TexCoords).rgb;

    vec3 ambient = 0.1 * color;

    vec3 lightDir = normalize(fs_in.TangentLightPos - fs_in.TangentFragPos);
    float diff = max(dot(lightDir, normal), 0.0);
    vec3 diffuse = diff * color;

    vec3 viewDir = normalize(fs_in.TangentViewPos - fs_in.TangentFragPos);
    vec3 reflectDir = reflect(-lightDir, normal);
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfwayDir), 0.0), 32.0);

    float theta = dot(lightDir, normalize(-direction));
    float epsilon = (cutOff - outerCutOff);
    float intensity = clamp((theta - outerCutOff) / epsilon, 0.0, 1.0);
    diffuse *= intensity;

    vec3 specular = vec3(0.2) * spec;
    specular *= intensity;

    float distance = length(fs_in.TangentLightPos - fs_in.FragPos);
    float attenuation = 1.0 / (constant  + linear * distance + quadratic * (distance * distance));

    ambient *= attenuation;
    diffuse *= attenuation;
    specular *= attenuation;

    FragColor = vec4(ambient + diffuse + specular, 1.0);
}
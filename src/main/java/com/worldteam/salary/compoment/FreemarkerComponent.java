package com.worldteam.component;

import freemarker.template.Template;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils;
import org.springframework.web.servlet.view.freemarker.FreeMarkerConfigurer;

import java.util.Map;


@Component
@Scope("prototype")
public class FreemarkerComponent {

    protected static Logger logger = LoggerFactory.getLogger(FreemarkerComponent.class);

    /**
     * configurer
     */
    private final FreeMarkerConfigurer configurer;

    public FreemarkerComponent(FreeMarkerConfigurer configurer) {
        this.configurer = configurer;
    }

    public <T> String formatTemplate(String templatePath, T t) {
        try {
            Template template = configurer.getConfiguration().getTemplate(templatePath);
            String txt = FreeMarkerTemplateUtils.processTemplateIntoString(template, t);
            if (logger.isDebugEnabled()) {
                logger.debug(txt);
            }
            return txt;
        } catch (Exception e) {
            logger.error("freemarker format exception", e);
        }
        return null;
    }

    public String formatTemplate(String templatePath, Map<String, String> map) {
        try {
            Template template = configurer.getConfiguration().getTemplate(templatePath);
            String txt = FreeMarkerTemplateUtils.processTemplateIntoString(template, map);
            if (logger.isDebugEnabled()) {
                logger.debug(txt);
            }
            return txt;
        } catch (Exception e) {
            logger.error("freemarker format exception", e);
        }
        return null;
    }
}

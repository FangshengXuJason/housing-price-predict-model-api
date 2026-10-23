package com.housingprice.backend.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager cacheManager = new SimpleCacheManager();

        CaffeineCache modelInfoCache = buildCache("modelInfo", 10);
        CaffeineCache aggregateStatsCache = buildCache("aggregateStats", 5);
        CaffeineCache predictionResultCache = buildCache("predictionResult", 2);

        cacheManager.setCaches(Arrays.asList(
                modelInfoCache,
                aggregateStatsCache,
                predictionResultCache
        ));

        return cacheManager;
    }

    private CaffeineCache buildCache(String name, int ttlMinutes) {
        return new CaffeineCache(name, Caffeine.newBuilder()
                .expireAfterWrite(ttlMinutes, TimeUnit.MINUTES)
                .maximumSize(100)
                .build());
    }
}
